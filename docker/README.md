# Environment variable
## Mandatory variables
- *SERVER_PUBLIC_URL*: the url to access your map server (ex: https://map.example.org)

- *VERSATILES_FILES*: a space separated list of file path or url to versatiles files to serve. (ex: /data/osm.versatiles https://map.example.org/satellite.versatiles)Optional variables

## Optional variables
- *STYLES_OSM*: a comma separated list of styles to enable in: colorful,graybeard,eclipse,neutrino,shadow (leave empty to enable them all).

- *ENABLE_LOCALIZATION*: enable localized maps for French and English: Olvid application will try to show map labels using device language. 
Else the map will always display labels using local country language.

- *ENABLE_SATELLITE*: enable satellite style (you must download *satellite.versatiles* and add it in VERSATILES_FILES)

## Experimental variables
- *ENABLE_SATELLITE_HILLSHADE*: enable hillshade layer in satellite (you must download hillshade tiles and add them in VERSATILES_FILES)

- *ENABLE_SATELLITE_TERRAIN*: enable terrain layer in satellite (you must download terrain tiles and add them in VERSATILES_FILES)
