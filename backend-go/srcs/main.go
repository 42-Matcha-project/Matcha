package main

import (
	"net/http"
	"os"
	"srcs/auth"
	"srcs/middlewares"
	"srcs/models"
	"srcs/post"
	"srcs/utils"

	"github.com/gin-contrib/cors"
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
		//router.Use(cors.New(cors.Config{
		//	AllowOrigins:     []string{os.Getenv("ALLOWED_ORIGINS")}, // 本番環境のドメインのみ許可
		//	AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		//	AllowHeaders:     []string{"Content-Type", "Authorization"},
		//	AllowCredentials: true,
		//}))
	} else {
		router = gin.Default()
		gin.SetMode(gin.DebugMode)

		// ここにCORS設定を追加
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:3000"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
		}))
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
	postRoutes.GET("/retrieve", post.Retrieve)

	settingRoutes := router.Group("/settings")
	settingRoutes.Use(middlewares.JWTValidationMiddleware())
	settingRoutes.GET("/user", models.GetUserInfo)
	settingRoutes.PUT("/user", models.ChangeUserInfo)
	settingRoutes.DELETE("/user", models.DeleteUser)

	router.Run(":8080")
}
