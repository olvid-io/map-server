#!/bin/bash
set -e
cd $(dirname $0)

SERVER_URL=$1
if [ -z "${SERVER_URL}" ] ; then
  echo Please specify your public url
  exit 1
fi
SERVER_DIRECTORY=$(echo "${SERVER_URL#*://}")

handle_style() {
  STYLE=$1
  echo $STYLE
  # compute style
  mkdir -p build/${SERVER_DIRECTORY}/${STYLE}
  for lang in "en" "fr" "" ; do
    node builder/main.js --style-dir="./styles/${STYLE}" --output-dir="./build/${SERVER_DIRECTORY}/${STYLE}" --server="$SERVER_URL" --i18n=$lang
  done

  # copy files
  cp -r ./styles/${STYLE}/fonts ./build/${SERVER_DIRECTORY}/${STYLE}/fonts
  if [ -d "./styles/${STYLE}/sprites" ] ; then
    cp -r ./styles/${STYLE}/sprites ./build/${SERVER_DIRECTORY}/${STYLE}/sprites
  fi

  # create tar and delete temporary files
  (cd build/${SERVER_DIRECTORY} && tar -cvf ${STYLE}.tar ${STYLE} && rm -r ./${STYLE})

  echo Computed build/${STYLE}.tar
}

STYLE=$2
if [ -z "$STYLE" ] ; then
  echo Please specify style to compute
  exit 1
elif [ "$STYLE" = "all" ] ; then
  for style in `ls ./styles` ; do
    handle_style $style
  done
elif [ -d "./styles/$STYLE" ] ; then
    handle_style $STYLE
else
  echo "Invalid style name: $STYLE (and not all)"
  exit 1
fi
