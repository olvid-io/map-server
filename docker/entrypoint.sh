#!/bin/sh

#####
# Start server
# Style builder must connect to local server to access versatiles files, so we start server,
# and then wait for it to start before generating styles.
#####
# download remote static files
export STATIC_FILES_FLAGS=""
if [ -n "${REMOTE_STATIC_FILES}" ]; then
  for remote_file in ${REMOTE_STATIC_FILES}; do
    remote_filename=$(basename $remote_file)
    echo Downloading: $remote_filename
    (cd /tmp && wget $remote_file && mv $remote_filename /app/$remote_filename && echo Downloaded /app/${remote_filename}) && STATIC_FILES_FLAGS="${STATIC_FILES_FLAGS} --static /app/${remote_filename}" || echo Remote file not found: $remote_file
  done
fi

# prepare static files options
if [ -n "${STATIC_FILES}" ] ; then
  for file in ${STATIC_FILES}; do
    STATIC_FILES_FLAGS="${STATIC_FILES_FLAGS} --static $file "
  done
fi

# start server in background (server must run to generate satellite style because it's fetch raster tilejson file)
mkdir -p /app/styles
echo server static files: $STATIC_FILES_FLAGS
echo server data: $DATA_FILES $@
/app/versatiles serve \
  -p 8080 \
  --static /app/frontend-dev.br.tar \
  --static /app/styles \
  ${STATIC_FILES_FLAGS} \
  $DATA_FILES \
  "$@" &
SERVER_PID=$!

echo "Waiting for server to respond on localhost:8080..."
until wget -q --spider http://127.0.0.1:8080/; do
  echo Wait for versatiles server start && sleep 1
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

# handle extra styles files
STYLES_FILE_FLAG=""
if [ -n "${EXTRA_JSON_STYLES_REMOTE_FILE}" ] ; then
    remote_filename=$(basename $EXTRA_JSON_STYLES_REMOTE_FILE)
    echo Downloading: $remote_filename
    (cd /tmp && wget $EXTRA_JSON_STYLES_REMOTE_FILE && mv $remote_filename /app/$remote_filename && echo Downloaded /app/${remote_filename}) && STYLES_FILE_FLAG="-e /app/${remote_filename}" || echo Remote file not found: $remote_file
elif [ -n "${EXTRA_JSON_STYLES_FILE}" ] ; then
  if [ -f "${EXTRA_JSON_STYLES_FILE}" ] ; then
    STYLES_FILE_FLAG="-e ${EXTRA_JSON_STYLES_FILE}"
  else
    echo Extra styles file not found: ${EXTRA_JSON_STYLES_FILE}
 fi
fi

# optional flags
ENABLE_LOCALIZATION=$(if [ -n "$ENABLE_LOCALIZATION" ] ; then echo "-l" ; fi)
ENABLE_SATELLITE_HILLSHADE=$(if [ -n "$ENABLE_SATELLITE_HILLSHADE" ] ; then echo "-h" ; fi)
ENABLE_SATELLITE_TERRAIN=$(if [ -n "$ENABLE_SATELLITE_TERRAIN" ] ; then echo "-t" ; fi)

OPTIONS="${ENABLE_LOCALIZATION} ${ENABLE_SATELLITE_HILLSHADE} ${ENABLE_SATELLITE_TERRAIN} ${STYLES_FILE_FLAG}"

echo "SERVER_PUBLIC_URL: ${SERVER_PUBLIC_URL}"
echo "ALL_STYLES: ${ALL_STYLES}"
echo "OPTIONS: ${OPTIONS}"

echo "Generating styles..."

# Build JSON style files and styles.json file
(cd /app/style_builder &&  npx tsx /app/style_builder/main.ts -d /app/styles ${OPTIONS} "${SERVER_PUBLIC_URL}" "${ALL_STYLES}")

# resume server process
wait $!
