#使うDockerイメージ
FROM mysql

#MySQL設定ファイルをイメージ内にコピー
ADD ./my.cnf /etc/mysql/conf.d/my.cnf
ADD ./create-tables.sql /

COPY ./entry-point.sh /
RUN chmod +x /entry-point.sh

CMD ["mysqld"]

