FROM mysql:9.2.0
COPY ./configs/my.cnf /etc/my.cnf
COPY ./init/create-default-table.sql /docker-entrypoint-initdb.d
COPY ./entry-point.sh /
RUN chmod +x /entry-point.sh
#CMD ["/entry-point.sh"]
