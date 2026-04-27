# 🌍 Olvid Map Server

This repository contains the source code for a custom Docker image and deployment scripts designed to host a tile server compatible with Olvid location sharing.

This repository aims at letting you easily host such a map server for use within Olvid, but this server is compatible with any MapLibre application (Node.js or native), and could also be used for other use cases.

⚠ Note: Currently, only the Android version of Olvid supports custom map servers.

# 🚀 Quickstart

## Requirements

Hosting the world map in vector format takes up 60GB of disk space, but it is possible to select only a specific region of the world to reduce the required disk space.
The server only serves a static file and therefor requires very little processing and memory.

We recommand using docker to run the *versatiles* server, but you can run a versatile server locally and check how we build the JSON style files in *./docker/style-builder*.

If you need to build a large scalable server, you can see how we build our production server in `./clever-cloud`.

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
      - DATA_FILES=/data/osm.versatiles
    volumes:
      - ./data:/data:ro
    ports:
      - "127.0.0.1:8080:8080"
    restart: unless-stopped
```

## Download tiles
Now you need to download the tile file from [Versatiles](https://download.versatiles.org/) server. To achieve this we will use a temporary docker container, but you can use any alternative download method ([see Versatiles doc](https://docs.versatiles.org/guides/download_tiles.html)).

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

In order to use your custom map server inside Olvid, you need to expose it on the internet, in HTTPS, with a valid certificate that the Android OS will accept ([Let's Encrypt](https://letsencrypt.org/) certificates work very well). Then, configure Olvid to use this map server.

### Configuring a custom map server within Olvid for Android
Within Olvid you have the choice between different map providers:
- OpenStreetMap, on servers operated by Olvid,
- Google Maps,
- no map provider (only GPS coordinates are shared),
- a custom OpenStreetMap server.

You can choose which provider to use by going into Olvid's: Settings > Location sharing > Integration with a map provider. This option can also be changed by long pressing a location you sent or received from a contact.

When selecting custom OpenStreetMap you have two options, you can set:
- **the multi-style Olvid JSON file url**: this lets you choose between different map styles directly within Olvid. This file is exposed at https://map.example.org/styles.json.
- **a single map style url**: you need to point Olvid directly to the URL of the JSON style file, (eg: https://map.example.org/colorful.json)

You simply need to enter the URL of your single/multiple style JSON file and the next map you open in Olvid will use your custom style. If Olvid fails to load your style (typically, the wrong URL or a bad file format), an error message will be shown.

In order to easily configure your app, or to share your custom map server with friends, you can also generate a "setting URL" that allows to configure the map provider by scanning a QR code. Visit our [Settings generator](https://olvid.io/settings/) and simply enter your style url in Location sharing > Map provider integration.

# ⚙️ Configuration
## Environment
Environment variables used by `olvid/map-server` image are described in `./docker/README.md`.

## Test and Troubleshooting
You can check your server logs with `docker compose logs`.

You can also open `./test/map.html` in any web-browser, enter your server public URL (eg: https://map.example.org) and browse your map.

If you face issues in your Olvid application check your server exposes a `/styles.json` file. This list the URLS to the style files. Check JSON style files seems coherent, especially URLs in *sources*, *glyphs* and *sprite* sections.  

# 🙏 Acknowledgments

Our project relies on various elements from around the world of open source and free software. We use, in particular, [OpenStreetMap](https://openstreetmap.org) data, [Versatiles](https://versatiles.org) and [MapLibre](https://maplibre.org/).

A massive thank you to all those projects and their contributors. This project would not be possible without their open-source contributions.

# 📄 License

This repository is published under MIT License, the full license is available in `LICENSE`. 
