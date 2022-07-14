#!/bin/bash

set -e

JSONFILE="curl_tmp.txt"

curl -X POST localhost:8000 \
    -H 'Content-Type: application/json' \
    -d '{"action":"new_session"}' \
    -o "${JSONFILE}"

curl -X POST localhost:8000 \
    -H 'Content-Type: application/json' \
    -d @${JSONFILE}
