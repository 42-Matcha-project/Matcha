#!/bin/bash

echo "CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';" >> /docker-entrypoint-initdb.d/create-default-table.sql
echo "GRANT ALL PRIVILEGES ON matcha.* TO '${MYSQL_USER}'@'%';" >> /docker-entrypoint-initdb.d/create-default-table.sql
echo "FLUSH PRIVILEGES;" >> /docker-entrypoint-initdb.d/create-default-table.sql
