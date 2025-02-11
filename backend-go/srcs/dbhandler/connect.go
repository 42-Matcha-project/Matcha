package dbhandler

import (
	"fmt"
	"gorm.io/gorm/schema"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"srcs/models"
)

var DB *gorm.DB

func ConnectDataBase() {
	/*
		環境変数からDSNを生成し、DATABASEとの接続を確立する関数。
		テーブル名には"t_"というprefixをつけるように設定
	*/
	dbUser := os.Getenv("MYSQL_USER")
	dbPass := os.Getenv("MYSQL_USER_PASSWORD")
	dbName := os.Getenv("DATABASE_NAME")
	dbHost := os.Getenv("DATABASE_HOST")
	dbPort := os.Getenv("DATABASE_PORT")

	fmt.Printf("User: %s, Pass: %s, DB: %s, Host: %s, Port: %s\n", dbUser, dbPass, dbName, dbHost, dbPort)

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort, dbName)
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix: "t_",
		},
	})

	if err != nil {
		log.Fatal("Could not connect to the database", err)
	}

	DB.AutoMigrate(&models.User{})
}
