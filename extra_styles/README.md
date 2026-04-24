# Custom Maps

## 📣 Disclaimer
This directory was made for an internal use, we use it to add extra styles to our map server.

This repo does not cover how to compute pmtiles files, but we mainly use [planetiler](https://github.com/onthegomap/planetiler) project with profiles provided by each style.

## 🗺 Styles

Each style is prepared as standalone tarball containing JSON style file and necessary assets (glyphs and fonts).
We use build.sh to build maps for a specific server with locale, English and French translations, and create tarball to upload.

Once the tarball has been uploaded to our clever cloud cellar bucket we can ask our server to download them and host those static files with: STATIC_FILES or REMOTE_STATIC_FILES.

You also need to add your data files to DATA_FILES environment variable.

Here is an example of environment configuration for a docker server with extra styles:
```env
SERVER_PUBLIC_URL=https://map.example.org
ENABLE_LOCALIZATION=true
DATA_FILES=/data/osm.versatiles /data/planet_osm.pmtiles
STATIC_FILES=/data/qwant.tar /data/liberty.tar /data/maptiler_basic.tar /data/maptiler_toner.tar
EXTRA_JSON_STYLES_FILE=/data/map_extra_styles.json
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
