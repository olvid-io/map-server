# 🌍 Olvid Map Server

This repository contains the source code for a custom Docker image and deployment scripts designed to host a tile server compatible with Olvid location sharing.

This repository aim is to let you easily host a map tile server, that you can use in Olvid for the location sharing feature. But this server is compatible with any MapLibre application (nodejs or native), and might be used for different use cases.

⚠ Note: Currently, only the Olvid application for Android supports the use of a customized map server.

# 🚀 Quickstart

## Requirements

Hosting the world map in vector format uses 60GB of disk space, but it is possible to select only a specific region to reduce the required disk space.
The server only serves a static file and therefore requires very few processor resources and memory.

We recommand to use docker to run the *versatiles* server, but you can run a versatile server locally and check how we build the json style files in *./docker/style-builder*.

If you need to build a large scalable server you can see how we build our production server in `./clever-cloud`.

## Setup

Create a `docker-compose.yaml` file with the following services, replacing SERVER_PUBLIC_URL value with the url your server will be accessible from (eg: https://map.example.org).
```yaml
services:
  map:
    image: olvid/map-server
    environment:
      - SERVER_PUBLIC_URL=http://localhost:8080
      - STYLES_OSM=colorful,graybeard,eclipse,neutrino,shadow
      - ENABLE_LOCALIZATION=true
      - VERSATILES_FILES=/data/osm.versatiles
    volumes:
      - ./data:/data:ro
    ports:
      - "127.0.0.1:8080:8080"
```

## Download tiles
Now you need to download the tile file from [Versatiles](https://download.versatiles.org/) server. To achieve this we will use a temporary docker container, but you can use any alternative download method.

If do not want to host the entire planet we recommend to use the [Versatiles Setup Server Tool](https://versatiles.org/tools/setup_server), answer until a map appear, select the area you want to download and use the computed download command. Mind to store file as `./data/osm.versatiles`. 

```bash
docker run -it --rm -v $(pwd)/data:/data \
  versatiles/versatiles:latest convert \
  "https://download.versatiles.org/osm.versatiles" \
  "/data/osm.versatiles"
```

## Let's go

You can now start your server.

```yaml
docker compose up -d
```

To expose publicly we recomment to use a reverse proxy that will handle https setup for you Here is an example of *Caddyfile* but you can use any other reverse proxy (*nginx*, *traefik*, ...)

```
map.example.org {
  reverse_proxy localhost:8080
}
```

## Setup in Olvid

[//]: # (- TODO )
To use your custom server in Android Application: https://map.example.org/styles.json
- go to settings
- use a configuration link

# ⚙️ Configuration
## Environment
Environment variables used by `olvid/map-server` image are described in `./docker/README.md`.

## Test and Troubleshooting
You can check your server logs with `docker compose logs`.

You can also open `./test/map.html` in any web-browser, enter your server public URL (eg: https://map.example.org) and browse your map.

If you face issues in your Olvid application check your server exposes a `/styles.json` file. This list the URLS to the style files. Check JSON style files seems coherent, especially URLs in *sources*, *glyphs* and *sprite* sections.  

[//]: # (TODO setup satellite )

# 🙏 Acknowledgments

Our project relies on various elements from around the world of open source and free software. We use, in particular, [OpenStreetMap](https://openstreetmap.org) data, [Versatiles](https://versatiles.org) and [MapLibre](https://maplibre.org/).

A massive thank you to all those projects and their contributors. This project would not be possible without their open-source contributions.

# 📄 License

This repository is published under MIT License, the full license is available in `LICENSE`. 