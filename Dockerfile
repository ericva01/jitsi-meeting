# ============================================
# Stage 1: Build customized Jitsi Meet
# ============================================

FROM node:24-bookworm-slim AS build

RUN apt-get update \
    && apt-get install --no-install-recommends -y make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

COPY package.json package-lock.json .npmrc ./

# Skip Android-related postinstall scripts.
RUN npm ci --ignore-scripts

COPY . .

RUN npx patch-package --error-on-fail

RUN make compile deploy


# ============================================
# Stage 2: Official Jitsi Web runtime
# ============================================

FROM ghcr.io/jitsi/web:stable-11146-1

# Customized root files
COPY --from=build /src/*.html /usr/share/jitsi-meet/
COPY --from=build /src/*.js /usr/share/jitsi-meet/
COPY --from=build /src/manifest.json /usr/share/jitsi-meet/manifest.json

# Customized compiled/static resources
COPY --from=build /src/css /usr/share/jitsi-meet/css
COPY --from=build /src/fonts /usr/share/jitsi-meet/fonts
COPY --from=build /src/images /usr/share/jitsi-meet/images
COPY --from=build /src/lang /usr/share/jitsi-meet/lang
COPY --from=build /src/libs /usr/share/jitsi-meet/libs
COPY --from=build /src/sounds /usr/share/jitsi-meet/sounds
COPY --from=build /src/static /usr/share/jitsi-meet/static