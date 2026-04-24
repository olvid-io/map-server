#!/bin/bash
set -e
cd $(dirname $0)

SERVER_URL=$1
if [ -z "${SERVER_URL}" ] ; then
  echo Please specify your public url
  exit 1
fi
SERVER_DIRECTORY=$(echo "${SERVER_URL#*://}")

upload_style() {
  STYLE=$1
  s3cmd -c $S3_CFG sync ./build/$SERVER_DIRECTORY/$STYLE.tar s3://${BUCKET_NAME}
}
upload_extra_styles() {
  s3cmd -c $S3_CFG sync ./extra_styles.json s3://${BUCKET_NAME}
}

if [ "$SERVER_DIRECTORY" = "versatiles.olvid.io" ] ; then
  S3_CFG="../clever-cloud/prod-s3cfg"
  BUCKET_NAME=versatiles-prod
elif [ "$SERVER_DIRECTORY" = "versatiles.dev.olvid.io" ] ; then
  S3_CFG="../clever-cloud/dev-s3cfg"
  BUCKET_NAME=versatiles-dev
else
  echo Unknown server: $SERVER_DIRECTORY
  exit 1
fi

STYLE=$2
if [ -z "$STYLE" ] ; then
  echo Please specify style to compute
  exit 1
elif [ "$STYLE" = "all" ] ; then
  for style in `ls ./styles` ; do
    upload_style $style
  done
  echo Computing extra_styles.json
  jq "[ .[] | .url |= sub(\"map.example.org\"; \"$SERVER_DIRECTORY\") ]" extra_styles.json > ./build/$SERVER_DIRECTORY/extra_styles.json
  echo uploading extra_styles.json
  s3cmd -c $S3_CFG sync ./build/$SERVER_DIRECTORY/extra_styles.json s3://${BUCKET_NAME}/extra_styles.json
elif [ ! -d "./styles/$STYLE" ] ; then
  echo Invalid style name: $STYLE
  exit 1
fi
