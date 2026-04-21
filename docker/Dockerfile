FROM versatiles/versatiles-frontend:v3.9.0

EXPOSE 8080

# add style builder
RUN apk add --update nodejs npm
RUN mkdir /app/style_builder
COPY style_builder/main.ts /app/style_builder
COPY style_builder/package.json /app/style_builder
RUN cd /app/style_builder && npm i && npm i tsx

# entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/sbin/tini", "/entrypoint.sh"]
