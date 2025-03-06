#!/bin/bash

docker build -t frontend-nodejs ./frontend-nodejs
docker run -d \
  --name frontend-nodejs \
  -p 3000:3000 \
  -v "$(pwd)/frontend-nodejs/srcs/:/usr/src/app/srcs" \
  --env-file .env \
  frontend-nodejs