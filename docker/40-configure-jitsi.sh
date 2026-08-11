#!/bin/sh
set -eu

: "${JITSI_DOMAIN:=jitsi-meet.example.com}"
: "${BOSH_URL:=https://${JITSI_DOMAIN}/http-bind}"
: "${WEBSOCKET_URL:=wss://${JITSI_DOMAIN}/xmpp-websocket}"

escape_sed_replacement() {
    printf '%s' "$1" | sed 's/[&|]/\\&/g'
}

domain=$(escape_sed_replacement "$JITSI_DOMAIN")
bosh=$(escape_sed_replacement "$BOSH_URL")
websocket=$(escape_sed_replacement "$WEBSOCKET_URL")

sed \
    -e "s|https://jitsi-meet\.example\.com/http-bind|$bosh|g" \
    -e "s|wss://jitsi-meet\.example\.com/xmpp-websocket|$websocket|g" \
    -e "s|jitsi-meet\.example\.com|$domain|g" \
    /usr/share/nginx/html/config.js.template \
    > /usr/share/nginx/html/config.js
