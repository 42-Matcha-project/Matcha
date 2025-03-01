package main

import (
	"net/http"
	"os"
	"srcs/auth"
	"srcs/middlewares"
	"srcs/models"
	"srcs/post"
	"srcs/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	/*
		DB接続を確立し、ルーティングをする関数。
	*/
	models.ConnectDataBase()

	var router *gin.Engine
	if os.Getenv("ENVIRONMENT") == "production" {
		router = gin.New()
		router.Use(utils.ProductionLogger())
		router.Use(gin.Recovery())
		gin.SetMode(gin.ReleaseMode)
	} else {
		router = gin.Default()
		gin.SetMode(gin.DebugMode)
	}

	router.GET("/health", func(reqContext *gin.Context) {
		reqContext.JSON(http.StatusOK, gin.H{
			"status": "OK",
		})
	})

	authRoutes := router.Group("/auth")
	authRoutes.POST("/register", auth.Register)
	authRoutes.POST("/login", auth.Login)

	postRoutes := router.Group("/posts")
	postRoutes.POST("/submit", post.Submit)

	settingRoutes := router.Group("/settings")
	settingRoutes.Use(middlewares.JWTValidationMiddleware())
	settingRoutes.GET("/user", models.GetUserInfo)
	settingRoutes.PUT("/user", models.ChangeUserInfo)
	settingRoutes.DELETE("/user", models.DeleteUser)

	router.Run(":8080")
}
