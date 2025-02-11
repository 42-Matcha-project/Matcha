FROM mysql:9.2.0
COPY ./configs/my.cnf /etc/my.cnf
COPY ./init/create-default-table.sql /docker-entrypoint-initdb.d
COPY ./entry-point.sh /
RUN chmod +x /entry-point.sh

ARG MYSQL_USER
ARG MYSQL_USER_PASSWORD
ENV MYSQL_USER=$MYSQL_USER
ENV MYSQL_USER_PASSWORD=$MYSQL_USER_PASSWORD

RUN /entry-point.sh
