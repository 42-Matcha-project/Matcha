package main

import (
	"net/http"
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

	router.GET("/health", func(reqContext *gin.Context) {
		reqContext.JSON(http.StatusOK, gin.H{
			"status": "OK",
		})
	})

	authRoutes := router.Group("/auth")
	authRoutes.POST("/register", auth.Register)
	authRoutes.POST("/login", auth.Login)

	settingRoutes := router.Group("/settings")
	settingRoutes.Use(middlewares.JWTValidationMiddleware())
	settingRoutes.GET("/user", models.GetUserInfo)
	settingRoutes.PUT("/user", models.ChangeUserInfo)
	settingRoutes.DELETE("/user", models.DeleteUser)

	router.Run(":8080")
}
