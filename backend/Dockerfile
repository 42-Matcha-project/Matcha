FROM golang:1.23.6-bookworm
WORKDIR /usr/src/app
COPY ./entry-point.sh /
RUN chmod +x /entry-point.sh
CMD ["/entry-point.sh"]