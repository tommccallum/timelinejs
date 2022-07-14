#!/bin/bash

set -e

curl -X POST localhost:8000 \
    -H 'Content-Type: application/json' \
    -d '{"action":"new_session"}'
