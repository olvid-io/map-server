/*
* style_args.js
*/
const yargs = require('yargs');

const styleArgs = yargs
    .usage('Usage: $0 [options]')
    .options({
        'style-dir': {
            describe: 'The folder with the style inside it',
            type: 'string',
            demandOption: true,
            nargs: 1
        }
    })
    .options({
        'output-dir': {
            describe: 'Output directory',
            type: 'string',
            demandOption: true,
            nargs: 1
        }
    })
    .options({
        server: {
            describe: 'Server url',
            type: 'string',
            demandOption: true,
            nargs: 1
        }
    })
    .options({
        i18n: {
            describe: "Name of the default locale that will be used to render the labels. If not defined, 'name' tag is always used.",
            type: 'string',
            nargs: 1,
            default: undefined
        }
    })
    .help('h')
    .alias('h', 'help')

/*
* transform.js
*/
function adjustStyleUrls(opts) {
    let style = opts.style;
    let conf = opts.conf_url;

    delete style.created;
    delete style.draft;
    delete style.modified;
    delete style.owner;
    delete style.metadata

    Object.values(style.sources).forEach(source => {
        source.tiles = [opts.server + "/tiles/" + conf.tileset_name + '/{z}/{x}/{y}'];
        source.scheme = "xyz";
    })

    if (conf.sprites) {
        style.sprite = opts.server + "/" + conf.sprites;
    }
    style.glyphs = opts.server + "/" + conf.fonts + "/{fontstack}/{range}.pbf";
}

/*
* i18n/index.js
*/
const nodeYaml = require('node-yaml')
const path = require('path')

function i18n(options, style) {
    let styleDir = options.styleDir

    if(options.i18n) {
        const languageFallbacks = nodeYaml.readSync(path.resolve(styleDir+'/i18n.yml')).languageFallbacks

        style.layers = style.layers.map((layer) => {
            if(layer['layout'] && layer['layout']['text-field'] && layer['layout']['text-field'] === "{name}") {
                let fallback = languageFallbacks.find((languageFallback) => {
                    return languageFallback.id === layer.id
                })

                if(fallback) {
                    layer['layout']['text-field'] = fallback.lang
                }
            }
            if(typeof options.i18n === 'string') {
                let lang = options.i18n;
                layer = JSON.parse(JSON.stringify(layer).replace(/\{locale\}/g, lang))
            }
            return layer
        })
    }

    return style
}

/*
* build.js
*/
const fs = require('fs-extra')

function build(style, options) {
    adjustStyleUrls({
        style: style,
        conf_url: options.conf,
        fonts: options.fonts,
        server: options.server,
    })

    /* apply i18n label logic */
    style = i18n(options, style)

    return JSON.stringify(style, null, "\t")
}

/*
* build_cli.js
*/
let args = styleArgs.argv;

const stylePath = path.join(args['style-dir'], 'style.json');
const confPath = path.join(args['style-dir'], "conf.json")
const confStr = fs.readFileSync(confPath, 'utf8');
const styleStr = fs.readFileSync(stylePath, 'utf8');
const style = JSON.parse(styleStr);
const jsonconf = JSON.parse(confStr);
const webfont = args.webfont
const pins = args.pins

let options = {
    styleDir: args['style-dir'],
    conf: jsonconf,
    pixelRatios: [1,2],
    i18n: args['i18n'],
    icons: args['icons'],
    webfont:webfont,
    pins: pins,
    server: args.server
};

options.output = 'production';
const builtStyle = build(style, options);
let outputStyleFilename;
if (args['i18n']) {
    outputStyleFilename = path.basename(args['style-dir']) + "_" + args["i18n"] + ".json";
}
else {
    outputStyleFilename = path.basename(args['style-dir']) + ".json";
}
outPath = path.join(args["output-dir"], outputStyleFilename);
fs.writeFileSync(outPath, builtStyle, 'utf8');

console.log(outPath)
