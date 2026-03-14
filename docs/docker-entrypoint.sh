#!/bin/sh
# Docs use relative paths only; no config.json bootstrap.
set -e
exec nginx -g "daemon off;"
