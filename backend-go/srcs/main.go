package main

import (
	"srcs/auth"
	"srcs/middlewares"
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

	settingRoutes := router.Group("/settings")
	settingRoutes.Use(middlewares.JWTValidationMiddleware())
	settingRoutes.GET("/user", models.GetUserInfo)
	settingRoutes.PUT("/user", models.ChangeUserInfo)
	settingRoutes.DELETE("/user", models.DeleteUser)

	router.Run(":8080")
}
