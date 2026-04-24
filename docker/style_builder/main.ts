import {colorful, graybeard, eclipse, neutrino, shadow, satellite, StyleBuilderOptions, SatelliteStyleOptions} from '@versatiles/style';
import {exists, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {program, Argument, Option} from "commander";

/*
* This program build style json files and a styles.json file listing all available styles.
* Style files follows standard MapLibre Json Style specification.
* styles.json file is an Olvid specific file, used in application to show a style picker.
 */

program
	.name("style-builder")
	.description("Build MapLibre style files and styles.json list for versatiles.")
	.version("1.0.0")
	.option("-d, --dir <string>", "Output directory", "./build")
	.addArgument(new Argument("<serverUrl>", "your server public url (ex: https://map.example.org)"))
	.addArgument(new Argument("<styles>", "comma separated list of styles"))
	.addOption(new Option("-l, --language", "enable language variants for styles [fr,en] and placeholders in list").default(false))
	.addOption(new Option("-h, --hillshade", "Enable hillshade layer for satellite style").default(false))
	.addOption(new Option("-t, --terrain", "Enable terrain layer for satellite style").default(false))
	.addOption(new Option("-e, --extra <string>", "Filepath to a valid styles.json file to concatenate with generated styles. Must be a valid json list."))
	.action(async (serverUrl: string, stylesArg: string) => {
		const options = program.opts();
		const outputDir: string = options.dir;
		const enableLanguage: boolean = options.language;
		const hillshade: boolean = options.hillshade;
		const terrain: boolean = options.terrain;
		const extraStylesFile: string = options.extra;

		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
		}

		const stylesList: string[] = stylesArg.split(",").map(s => s.trim()).filter(s => s.length > 0);

		const languages: (string | undefined)[] = [undefined];
		if (enableLanguage) {
			languages.push("en", "fr");
		}

		const usualStyleNames: { [key: string]: { en: string, fr: string } } = {
			"colorful": {"en": "Colorful", "fr": "Coloré"},
			"graybeard": {"en": "Graybeard", "fr": "Vieux sage"},
			"eclipse": {"en": "Eclipse", "fr": "Éclipse"},
			"neutrino": {"en": "Neutrino", "fr": "Neutrino"},
			"shadow": {"en": "Shadow", "fr": "Ombres"},
			"satellite": {"en": "Satellite", "fr": "Satellite"},
		};

		const jsonStylesList: {id: string, name?: {en: string, fr: string}, url: string}[] = [];

		for (const styleName of stylesList) {
			console.log(`Generating style: ${styleName}`);

			// Add to styles.json list
			const url: string = enableLanguage ? `${serverUrl}/${styleName}[LANG].json` : `${serverUrl}/${styleName}.json`;
			jsonStylesList.push({
				id: styleName,
				url: url,
				name: usualStyleNames.hasOwnProperty(styleName) ? usualStyleNames[styleName] : undefined,
			});

			// Generate map style JSON files for each language variant
			for (const language of languages) {
				try {
					const styleBuilderOptions: StyleBuilderOptions = {
						baseUrl: serverUrl,
						language: language as string,
					}

					let jsonStyle: object;
					switch (styleName) {
						case "colorful": jsonStyle = colorful(styleBuilderOptions); break;
						case "graybeard": jsonStyle = graybeard(styleBuilderOptions); break;
						case "eclipse": jsonStyle = eclipse(styleBuilderOptions); break;
						case "neutrino": jsonStyle = neutrino(styleBuilderOptions); break;
						case "shadow": jsonStyle = shadow(styleBuilderOptions); break;
						case "satellite": {
							const satelliteStyleBuilderOptions: SatelliteStyleOptions = {
								baseUrl: styleBuilderOptions.baseUrl,
								language: styleBuilderOptions.language,
								hillshade: hillshade,
								terrain: terrain,
								overlay: true
							}
							jsonStyle = await satellite(satelliteStyleBuilderOptions);
							break;
						}
						default:
							console.warn(`Unknown style requested: ${styleName}`);
							continue;
					}

					if (jsonStyle) {
						const suffix = !language ? "" : "_" + language;
						const filePath = `${outputDir}/${styleName}${suffix}.json`;
						writeFileSync(filePath, JSON.stringify(jsonStyle));
					}
				} catch (error) {
					console.error("Cannot generate style: ", styleName, language);
					console.error(error);
				}
			}
		}

		// Write the consolidated styles.json file
		const stylesListPath = `${outputDir}/styles.json`;
		console.log(`Writing list: ${stylesListPath}`);
		if (extraStylesFile) {
			if (!existsSync(extraStylesFile)) {
				console.error("Extra styles file not found:", extraStylesFile);
			} else {
				console.log("Found extra styles file:", extraStylesFile);
				try {
					const extraStylesList = JSON.parse(readFileSync(extraStylesFile, "utf8"));
					for (const jsonStyle of extraStylesList) {
						jsonStylesList.push(jsonStyle);
					}
				} catch (err) {
					console.error(err);
				}
			}
		}
		writeFileSync(stylesListPath, JSON.stringify(jsonStylesList));
	});

program.parse();
