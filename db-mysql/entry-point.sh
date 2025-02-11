#!/bin/bash

echo "CREATE USER '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_USER_PASSWORD}';" >> /docker-entrypoint-initdb.d/create-default-table.sql
echo "GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER}'@'localhost' WITH GRANT OPTION;" >> /docker-entrypoint-initdb.d/create-default-table.sql
echo "FLUSH PRIVILEGES;" >> /docker-entrypoint-initdb.d/create-default-table.sql