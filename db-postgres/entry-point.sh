#!/bin/bash

echo "DO \$\$
      BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${POSTGRES_GENERAL_USER}') THEN
      CREATE ROLE "${POSTGRES_GENERAL_USER}" WITH LOGIN PASSWORD '${POSTGRES_GENERAL_PASSWORD}';
      END IF;
      END \$\$;" >> /docker-entrypoint-initdb.d/init.sql

echo "GRANT CONNECT ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_GENERAL_USER}";" >> /docker-entrypoint-initdb.d/init.sql
