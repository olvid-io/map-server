# Custom Maps

## 📣 Disclaimer
This directory was made for an internal use, we use it to add extra styles to our map server.

This repo does not cover how to compute pmtiles files, but we mainly use [planetiler](https://github.com/onthegomap/planetiler) project with profiles provided by each style.

## 🗺 Styles

### Static files
Each style is prepared as standalone tarball containing JSON style file and necessary assets (glyphs and fonts).

We use `build.sh` to build tarballs for a specific server with locale, English and French translations, and assets.

Then upload tarballs to cellar bucket, or add them in your docker volume. Then ask server to host them with STATIC_FILES or REMOTE_STATIC_FILES environment variables.

You will also need to add your data files to DATA_FILES environment variable.

Here is an example of environment configuration for a docker server with extra styles. (see next section to see how to build `extra_styles.json` file)
```env
SERVER_PUBLIC_URL=https://map.example.org
ENABLE_LOCALIZATION=true
DATA_FILES=/data/osm.versatiles /data/planet_osm.versatiles
STATIC_FILES=/data/qwant.tar /data/liberty.tar
EXTRA_JSON_STYLES_FILE=/data/extra_styles.json
```

Here is another example for a clever cloud server environment configuration. Because it is a cloud server with no persistent local storage, all files are remotely hosted in cellar, but this is not necessary in a classic docker server. 

```env
DATA_FILES="https://CELLAR_BUCKET_URL/osm.versatiles https://CELLAR_BUCKET_URL/satellite.versatiles https://CELLAR_BUCKET_URL/planet_osm.pmtiles https://CELLAR_BUCKET_URL/planet_maptiler.pmtiles https://CELLAR_BUCKET_URL/planet_protomaps.pmtiles"
ENABLE_LOCALIZATION="true"
ENABLE_SATELLITE="true"
EXTRA_JSON_STYLES_REMOTE_FILE="https://CELLAR_BUCKET_URL/extra_styles.json"
REMOTE_STATIC_FILES="https://CELLAR_BUCKET_URL/qwant.tar https://CELLAR_BUCKET_URL/liberty.tar https://CELLAR_BUCKET_URL/maptiler_basic.tar https://CELLAR_BUCKET_URL/maptiler_toner.tar"
SERVER_PUBLIC_URL="https://map.example.org"

# Clever Cloud variables 
APP_FOLDER="./docker"
CC_DOCKER_FIXED_CIDR_V6="fd00::/80"
CC_HEALTH_CHECK_PATH="/styles.json"
```

### Add extra styles to Multi-style Olvid JSON file
To let Olvid application know styles available on a server we created a custom Multi-style Olvid JSON file. This file is available at `/styles.json`.
Setting your Multi-style Olvid JSON file as custom OSM server allows application to show switch between different map style.  

To extend styles listed in application you can use EXTRA_JSON_STYLES_FILE or EXTRA_JSON_STYLES_REMOTE_FILE. This file must respect the same formating as `/styles.json` (both list will be merged).

Multi-style Olvid JSON files have the following structure:
```json
[
 {"id": "colorful",
  "name": {
   "en": "Colorful",
   "fr": "Coloré"
  },
  "url": "https://map.example.org/colorful[LANG].json"
 },
 {"id": "eclipse",
  "name": {
   "en": "Eclipse",
   "fr": "Éclipse"
  },
  "url": "https://map.example.org/eclipse[LANG].json"
 },
 {"id": "satellite",
  "name": {
   "en": "Satellite",
   "fr": "Satellite"
  },
  "url": "https://map.example.org/satellite[LANG].json"
 }
]
```

This is a JSON list of object that each contain:
- an `id` (mandatory): this is how Olvid internally identifies which style to use,
- a `name` map (optional): this is how the different styles will be shown inside Olvid. If no `name` map is present, the `id` is used as a fallback,
- the `url` of the style file. This url may contain `[LANG]` tag which is then replaced by the language used inside the app, restricted to languages present in the `name` map. In the example above, both `colorful_fr.json` and `colorful_en.json` styles must exist on the server. For users with a different language, `en` is used as a fallback. This allows having different localized maps depending on your language preference. Omit the `[LANG]` tag if you do not want to use localized maps.

