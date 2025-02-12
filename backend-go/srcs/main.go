package main

import (
	"srcs/auth"
	"srcs/models"

	"github.com/gin-gonic/gin"
)

func main() {
	/*
		DB接続を確立し、ルーティングをする関数。
	*/
	models.ConnectDataBase()

	router := gin.Default()

	authRoutes := router.Group("/auth")
	authRoutes.POST("/register", auth.RegisterUser)
	authRoutes.POST("/login", auth.Login)

	router.Run(":8080")
}
