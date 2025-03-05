#!/bin/bash

docker build -t backend-go .
docker run -it --rm \
  -p 8080:8080 \
  -v ./srcs:/usr/src/app/srcs \
  --env-file ./../.env \
  --name backend-go \
  backend-go