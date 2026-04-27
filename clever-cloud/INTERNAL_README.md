# Data source
We now use versatiles format to host tiles (more compatible with versatiles server than pmtiles).

We currently have 4 styles family:
- versatiles: download versatiles file directly from https://dowload.versatiles.org (osm.versatiles: colorful, graybeard, eclipse, neutrino and shadown; satellite.versatiles: satellite)
- "classic openstreetmap": download pbf file, use default planetiler profile to compute pmtiles file and convert with versatiles binary. (planet_osm.versatiles: qwant, liberty)
- maptiler: download pbf file, use maptiler profile with planetiler to compute pmtiles and convert to versatiles: (planet_maptiler.versatiles: vintage, toner)
- protomaps: download pmtiles from https://maps.protomaps.com/builds/ convert to versatiles: (planet_protomaps.versatiles: protomaps_light, protomaps_light)

To convert pmtiles to versatiles format:
```shell
docker run -it --rm -v ./data:/data versatiles/versatiles convert /data/planet_osm.pmtiles /data/planet_osm.pmtiles
```
We can then upload them to s3 using `s3cmd sync`.

# Bucket structure
Our production bucket file list:
```
2026-04-12 07:18 1050353731766  s3://versatiles-prod/satellite.versatiles
2026-04-12 08:20  62424006390  s3://versatiles-prod/osm.versatiles
2026-04-23 22:06  84924568803  s3://versatiles-prod/planet_maptiler.versatiles
2026-04-23 22:05  84924568803  s3://versatiles-prod/planet_osm.versatiles
2026-04-23 22:07 135176708563  s3://versatiles-prod/planet_protomaps.versatiles
2026-04-24 17:25     12308480  s3://versatiles-prod/liberty.tar
2026-04-24 17:25      9717760  s3://versatiles-prod/maptiler_basic.tar
2026-04-24 17:25     11253760  s3://versatiles-prod/maptiler_toner.tar
2026-04-24 17:25     13342720  s3://versatiles-prod/protomaps_dark.tar
2026-04-24 17:25     13342720  s3://versatiles-prod/protomaps_light.tar
2026-04-24 17:25     12759040  s3://versatiles-prod/qwant.tar
2026-04-24 16:58          833  s3://versatiles-prod/extra_styles.json
2026-04-24 07:40            9  s3://versatiles-prod/planet_version.txt
```
