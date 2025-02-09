#!/bin/bash

# MySQLが準備できるまで待機
until mysql -u root -p"$MYSQL_ROOT_PASSWORD" -h localhost -e "select 1" &>/dev/null; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

# データベースが存在しない場合、作成する
echo "Creating database 'recordings' if not exists..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -h localhost -e "CREATE DATABASE IF NOT EXISTS recordings;"

# 使用するデータベースに切り替える
echo "Selecting 'recordings' database..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -h localhost -e "USE recordings;"

# 他のSQLコマンドをここに追加できます
# 例えば、テーブルを作成するコマンドなどを追加できます
echo "Create tables..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -h mysql recordings < /create-tables.sql

echo "Database setup completed."

#mysql -u root -p
#rootpass
#CREATE DATABASE IF NOT EXISTS recordings;
#USE recordings;
#source /create-tables.sql