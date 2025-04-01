package models

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func createDataBase(dbUser string, dbPass string, dbHost string, dbPort string, dbName string) {
	/*
		データベース名を指定せずに接続したのち、データベースを作成する関数。
		元々存在していたら実行されない。
	*/
	dsnWithoutDB := fmt.Sprintf("host=%s user=%s password=%s port=%s dbname=postgres sslmode=disable", dbHost, dbUser, dbPass, dbPort)
	DB, err := gorm.Open(postgres.Open(dsnWithoutDB), &gorm.Config{})
	if err != nil {
		log.Fatal("Could not connect to database")
	}

	var exists bool
	DB.Raw("SELECT 1 FROM pg_database WHERE datname = ?", dbName).Scan(&exists)
	if !exists {
		DB.Exec(fmt.Sprintf("CREATE DATABASE %s OWNER %s", dbName, dbUser))
	}
}

func ConnectDataBase() {
	/*
		環境変数からDSNを生成し、DATABASEとの接続を確立する関数。
		Userテーブルを作成する。
	*/
	dbUser := os.Getenv("POSTGRES_USER")
	dbPass := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")
	dbHost := os.Getenv("DATABASE_HOST")
	dbPort := os.Getenv("DATABASE_PORT")

	createDataBase(dbUser, dbPass, dbHost, dbPort, dbName)
	var sslMode string
	if os.Getenv("ENVIRONMENT") == "development" {
		sslMode = "disable"
	} else {
		sslMode = "require"
	}
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s", dbHost, dbUser, dbPass, dbName, dbPort, sslMode)
	var err error
	DB, err = gorm.Open(
		postgres.Open(dsn),
		&gorm.Config{
			PrepareStmt: true,
		})

	if err != nil {
		log.Fatal("Could not connect to the database", err)
	}

	DB.SetupJoinTable(&TUser{}, "Buildings", &TUserBuilding{})
	DB.AutoMigrate(&TBuilding{})
	DB.AutoMigrate(&TWork{})
	DB.AutoMigrate(&TWorkLog{})
	DB.AutoMigrate(&TFriendship{})

	if os.Getenv("ENVIRONMENT") == "production" {
		postgresDB, err := DB.DB()
		if err != nil {
			log.Fatal("DB取得失敗:", err)
		}
		postgresDB.SetMaxIdleConns(10)
		postgresDB.SetMaxOpenConns(100)
		postgresDB.SetConnMaxLifetime(time.Hour)

		fmt.Println("DB接続成功！")
	}
}
