package main

import (
	"net/http"
	"os"
	"srcs/auth"
	"srcs/models"
	"srcs/study_room"
	"srcs/utils"
	"srcs/works"

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
		// 開発環境でもCORS設定を適用
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:3000"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Content-Type", "Authorization"},
			AllowCredentials: true,
		}))
	}

	// OPTIONSリクエストに対するグローバルハンドラ
	router.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	router.GET("/health", func(reqContext *gin.Context) {
		reqContext.JSON(http.StatusOK, gin.H{
			"status": "OK",
		})
	})

	authRoutes := router.Group("/auth")
	authRoutes.POST("/register", auth.Register)
	authRoutes.POST("/login", auth.Login)

	studyRoomRoutes := router.Group("/study-room")
	studyRoomRoutes.POST("/create", study_room.CreateStudyRoomHandler)
	studyRoomRoutes.DELETE("/delete", study_room.DeleteStudyRoomHandler)
	studyRoomRoutes.GET("/join/:roomCode", study_room.JoinStudyRoomHandler)

	worksRoutes := router.Group("/works")
	worksRoutes.POST("/add", works.AddWorkHandler)
	worksRoutes.GET("/get", works.GetWorksHandler)

	router.Run(":8080")
}
