#!/bin/sh

#####
# Start server
# Style builder must connect to local server to access versatiles files, so we start server,
# and then wait for it to start before generating styles.
#####
# start server in background (server must run to generate satellite style because it's fetch raster tilejson file)
mkdir -p /app/styles
echo server data: $VERSATILES_FILES $@
/app/versatiles serve \
  -p 8080 \
  --static /app/frontend-dev.br.tar \
  --static /app/styles \
  $VERSATILES_FILES \
  "$@" &
SERVER_PID=$!

echo "Waiting for server to respond on localhost:8080..."
until wget -q --spider http://127.0.0.1:8080/; do
  sleep 1
done

#####
# Style Builder
#####
# list osm styles to enable (all by default)
STYLES_OSM=${STYLES_OSM:-colorful,graybeard,eclipse,neutrino,shadow}

# compile all requested styles into a single comma-separated string
ALL_STYLES=$STYLES_OSM
if [ -n "$ENABLE_SATELLITE" ] ; then
  # Append satellite if enabled
  ALL_STYLES="${ALL_STYLES},satellite"
fi

# optional flags
ENABLE_LOCALIZATION=$(if [ -n "$ENABLE_LOCALIZATION" ] ; then echo "-l" ; fi)
ENABLE_SATELLITE_HILLSHADE=$(if [ -n "$ENABLE_SATELLITE_HILLSHADE" ] ; then echo "-h" ; fi)
ENABLE_SATELLITE_TERRAIN=$(if [ -n "$ENABLE_SATELLITE_TERRAIN" ] ; then echo "-t" ; fi)

echo "SERVER_PUBLIC_URL: $SERVER_PUBLIC_URL"
echo "ALL_STYLES: $ALL_STYLES"
echo "OPTIONS: ${ENABLE_LOCALIZATION} ${ENABLE_SATELLITE_HILLSHADE} ${ENABLE_SATELLITE_TERRAIN}"

echo "Generating styles..."
cd /app/style_builder || exit 1

# Build JSON style files and styles.json file
npx tsx /app/style_builder/main.ts -d /app/styles ${ENABLE_LOCALIZATION} ${ENABLE_SATELLITE_HILLSHADE} ${ENABLE_SATELLITE_TERRAIN} "${SERVER_PUBLIC_URL}" "${ALL_STYLES}"

# resume server process
wait $!
