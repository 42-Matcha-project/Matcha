package main

import (
	"net/http"
	"os"
	"srcs/auth"
	"srcs/models"
	"srcs/studyRoom"
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
		//router.Use(cors.New(cors.Config{
		//	AllowOrigins:     []string{os.Getenv("ALLOWED_ORIGINS")}, // 本番環境のドメインのみ許可
		//	AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		//	AllowHeaders:     []string{"Content-Type", "Authorization"},
		//	AllowCredentials: true,
		//}))
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

	studyRoomRoutes := router.Group("/study-room")
	studyRoomRoutes.POST("/create", studyRoom.CreateStudyRoomHandler)

	router.Run(":8080")
}
