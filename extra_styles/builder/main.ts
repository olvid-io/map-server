import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
// @ts-ignore
import yaml from 'js-yaml';

// ============================================================================
// Interfaces
// ============================================================================
interface Config {
    tileset_name?: string;
    sprites?: string;
    fonts?: string;
    [key: string]: any;
}

interface Layer {
    id: string;
    layout?: {
        'text-field'?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

interface Style {
    sources?: Record<string, {
        tiles?: string[];
        schema?: string;
        [key: string]: any;
    }>;
    sprite?: string;
    glyphs?: string;
    layers: Layer[];
    [key: string]: any;
}

interface I18nData {
    languageFallbacks?: Array<{
        id: string;
        lang: string;
    }>;
}

// ============================================================================
// 1. CLI Arguments Configuration
// ============================================================================
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .options({
        'style-dir': {
            describe: 'The folder containing the style files (style.json, conf.json, etc.)',
            type: 'string',
            demandOption: true
        },
        'style-file': {
            describe: 'The json style file name to use (overrides default style.json)',
            type: 'string'
        },
        'output-dir': {
            describe: 'Directory where the generated style will be saved',
            type: 'string',
            demandOption: true
        },
        'server': {
            describe: 'Public map-server URL for tiles, sprites, and fonts',
            type: 'string',
            demandOption: true
        },
        'i18n': {
            describe: 'Default locale for labels. If omitted, the "name" tag is used.',
            type: 'string'
        }
    })
    .help('h')
    .alias('h', 'help')
    .parseSync();

/**
 * Adjusts style URLs based on the conf.json and server
 */
function adjustStyleUrls(style: Style, conf: Config, serverUrl: string): Style {
    // Clone the style to avoid mutating the original object
    const newStyle: Style = { ...style };

    // Remove metadata/editor properties
    ['created', 'draft', 'modified', 'owner', 'metadata'].forEach(key => {
        delete newStyle[key];
    });

    // Update data sources
    if (newStyle.sources) {
        Object.values(newStyle.sources).forEach(source => {
            source.tiles = [`${serverUrl}/tiles/${conf.tileset_name}/{z}/{x}/{y}`];
            source.schema = "xyz";
        });
    }

    // Update sprites and fonts
    if (conf.sprites) {
        newStyle.sprite = `${serverUrl}/${conf.sprites}`;
    }
    if (conf.fonts) {
        newStyle.glyphs = `${serverUrl}/${conf.fonts}/{fontstack}/{range}.pbf`;
    }

    return newStyle;
}

/**
 * Applies language overrides to the text-field layers.
 */
function applyI18n(style: Style, styleDir: string, lang?: string): Style {
    if (!lang) return style;

    const i18nPath = path.join(styleDir, 'i18n.yml');
    let languageFallbacks: Array<{ id: string; lang: string }> = [];

    // Safely load i18n.yml if it exists
    if (fs.existsSync(i18nPath)) {
        const fileContents = fs.readFileSync(i18nPath, 'utf8');
        const i18nData = yaml.load(fileContents) as I18nData;
        languageFallbacks = i18nData?.languageFallbacks || [];
    } else {
        console.warn(`[Warn] i18n.yml not found at ${i18nPath}. Proceeding without fallbacks.`);
    }

    const newStyle: Style = { ...style };
    newStyle.layers = newStyle.layers.map((layer) => {
        const layout = layer.layout;

        // Apply fallback language logic to generic {name}
        if (layout && layout['text-field'] === "{name}") {
            const fallback = languageFallbacks.find(f => f.id === layer.id);
            if (fallback) {
                layout['text-field'] = fallback.lang;
            }
        }

        // Deep replace {locale} placeholder anywhere in the layer definition
        let layerString = JSON.stringify(layer);
        layerString = layerString.replace(/\{locale\}/g, lang);

        return JSON.parse(layerString) as Layer;
    });

    return newStyle;
}

// ============================================================================
// 3. Execution
// ============================================================================
function run(): void {
    const styleDir = argv['style-dir'];
    const styleFile = argv['style-file'] ? argv['style-file'] : undefined;
    const outputDir = argv['output-dir'];
    const stylePath = path.join(styleDir, styleFile ?? 'style.json');
    const confPath = path.join(styleDir, 'conf.json');

    // Ensure style and config exist
    if (!fs.existsSync(stylePath) || !fs.existsSync(confPath)) {
        console.error(`[Error] Missing style.json or conf.json in ${styleDir}`);
        process.exit(1);
    }

    // Load sources
    const rawStyle: Style = JSON.parse(fs.readFileSync(stylePath, 'utf8'));
    const conf: Config = JSON.parse(fs.readFileSync(confPath, 'utf8'));

    // Apply Transformations
    let processedStyle = adjustStyleUrls(rawStyle, conf, argv.server);
    processedStyle = applyI18n(processedStyle, styleDir, argv.i18n);

    // Determine output file name
    const baseName = path.basename(styleDir);
    let outputFilename;
    if (styleFile) {
        outputFilename = styleFile;
    } else {
        outputFilename = argv.i18n ? `${baseName}_${argv.i18n}.json` : `${baseName}.json`;
    }
    const outputPath = path.join(outputDir, outputFilename);

    // Ensure output directory exists before writing
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save Output
    fs.writeFileSync(outputPath, JSON.stringify(processedStyle, null, 2), 'utf8');

    console.log(`\n✅ Style successfully built!`);
    console.log(`📁 Output: ${outputPath}`);
}

run();
