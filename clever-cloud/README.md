# 💎 Clever Cloud deployment

This procedure is aimed for an internal use in Olvid to manage our production map server, but you can easily reproduce it to deploy a scalable map server based on [Versatiles](https://versatiles.org) and [Clever Cloud](https://www.clever.cloud/).

The built server aim to have very high-availability and automatic scalability thanks to clever cloud technology, and low costs per-user thanks to versatiles tiles format, hosted on a simple s3 compatible storage. 

If you just need a simple map server for yourself or a fixed amount of users you might probably use the Quickstart procedure at the root of this project. 

## ☁️ Setup

### Create a **Docker application**
You can use XS instances or bigger, from 1 to whatever you need.
Create and associate create a cellar addon.

### Cellar Addon
We recommend to use [s3cmd](https://s3tools.org/s3cmd) to manage your bucket files. You can download appropriate `s3cfg` file from your cellar addon configuration page.

#### Create a bucket
Create a new bucket. Mind that bucket names are global to the entire clever cloud infrastructure.
```shell
BUCKET_NAME=bucket-name
s3cmd -c s3cfg mb s3://${BUCKET_NAME}
```

#### Set bucket policy
Bucket must be public to allow app to access it.
```shell
BUCKET_NAME=bucket-name

<<eof cat >/tmp/policy.json
{
  "Id": "Policy1587216857769",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1587216727444",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
      "Principal": "*"
    }
  ]
}
eof

s3cmd -c s3cfg setpolicy /tmp/policy.json s3://$BUCKET_NAME
```

#### Upload files to bucket

To run long commands as upload and download we recommend to run commands in a `screen`. Start a new screen session with `screen -S s3cmd`, detach with CTRL+A + CTRL+Z and re-attach with `screen -xS s3cmd`.

You must download tiles locally, and then upload them to your bucket (or check [Versatiles doc](https://docs.versatiles.org/guides/download_tiles.html)).

```shell
BUCKET_NAME=bucket-name
wget https://download.versatiles.org/osm.versatiles
s3cmd -c s3cfg sync --multipart-chunk-size-mb=200 ./osm.versatiles s3://${BUCKET_NAME}/osm.versatiles
```

To download satellite raster tiles it's the same operation, but you need 1To of free storage space locally, and a fast and reliable internet connection (using a remote server seems to be a good option).
```shell
BUCKET_NAME=bucket-name
wget https://download.versatiles.org/satellite.versatiles
s3cmd -c s3cfg sync --multipart-chunk-size-mb=200 ./satellite.versatiles s3://${BUCKET_NAME}/satellite.versatiles
```

### App
#### Add a domain name to your application
Add a `CNAME` record to `domain.par.clever-cloud.com.`, then setup domain name in clever cloud console.

#### Setup App environment variables
Replace DOMAIN_NAME and BUCKET_NAME.
```env
APP_FOLDER="./docker"
ENABLE_LOCALIZATION="true"
SERVER_PUBLIC_URL="https://DOMAIN_NAME"
VERSATILES_FILES="https://BUCKET_NAME.cellar-c2.services.clever-cloud.com/osm.versatiles"
```

If you downloaded `satellite.versatiles` and want to enable satellite style use this configuration instead (enable style, and add satellite in served files).
```env
APP_FOLDER="./docker"
ENABLE_LOCALIZATION="true"
ENABLE_SATELLITE="true"
SERVER_PUBLIC_URL="https://DOMAIN_NAME"
VERSATILES_FILES="https://BUCKET_NAME.cellar-c2.services.clever-cloud.com/osm.versatiles https://BUCKET_NAME.cellar-c2.services.clever-cloud.com/satellite.versatiles"
```

### Optional env variables
```env
CC_DOCKER_FIXED_CIDR_V6="true"
CC_HEALTH_CHECK_PATH="/styles.json"
CC_PREVENT_LOGSCOLLECTION=true
```
