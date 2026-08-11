FROM node:24-bookworm-slim AS build

RUN apt-get update \
    && apt-get install --no-install-recommends -y make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN make compile deploy

FROM nginx:1.28-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/40-configure-jitsi.sh /docker-entrypoint.d/40-configure-jitsi.sh

COPY --from=build /src/*.html /usr/share/nginx/html/
COPY --from=build /src/*.js /usr/share/nginx/html/
COPY --from=build /src/manifest.json /usr/share/nginx/html/manifest.json
COPY --from=build /src/css /usr/share/nginx/html/css
COPY --from=build /src/fonts /usr/share/nginx/html/fonts
COPY --from=build /src/images /usr/share/nginx/html/images
COPY --from=build /src/lang /usr/share/nginx/html/lang
COPY --from=build /src/libs /usr/share/nginx/html/libs
COPY --from=build /src/sounds /usr/share/nginx/html/sounds
COPY --from=build /src/static /usr/share/nginx/html/static

RUN cp /usr/share/nginx/html/config.js /usr/share/nginx/html/config.js.template \
    && chmod +x /docker-entrypoint.d/40-configure-jitsi.sh

EXPOSE 80

