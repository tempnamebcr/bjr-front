#!/bin/sh
set -e

# node_modules/ is a named volume, so the directory always exists (even empty).
# Check for a file inside it instead, otherwise `npm ci` never runs on a fresh volume.
if [ ! -d node_modules/.bin ]; then
    npm ci
fi

exec "$@"
