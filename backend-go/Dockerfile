FROM golang:1.23.6-bookworm
WORKDIR /usr/src/app
COPY ./json_data ./json_data
COPY ./Makefile .
RUN chmod +x ./Makefile
CMD ["make", "run"]