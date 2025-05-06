package main

import (
	sentrygin "github.com/getsentry/sentry-go/gin"
	"net/http"
	"os"
	"srcs/admin"
	"srcs/auth"
	"srcs/buildings"
	"srcs/characters"
	"srcs/friends"
	"srcs/middlewares"
	"srcs/models"
	"srcs/monitoring"
	"srcs/password"
	"srcs/profile"
	"srcs/reports"
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
		monitoring.InitSentry()
		router = gin.New()
		router.Use(sentrygin.New(sentrygin.Options{}))
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
			"Status": "OK",
		})
	})

	admin.CreateAdminUser()
	buildings.SetDefaultBuildingInStore()
	characters.SetDefaultCharacterInStore()

	authRoutes := router.Group("/auth")
	otpRoutes := authRoutes.Group("/otp")
	otpRoutes.POST("/generate", auth.GenerateOTPHandler)
	otpRoutes.POST("/verify", auth.VerifyOTPHandler)
	authRoutes.POST("/register", auth.Register)
	authRoutes.POST("/login", auth.Login)

	profileRoutes := router.Group("/profile")
	profileRoutes.Use(middlewares.JWTValidationMiddleware())
	profileRoutes.GET("/get", profile.GetProfileHandler)
	profileRoutes.PUT("/update", profile.UpdateProfileHandler)

	passwordRoutes := router.Group("password")
	passwordRoutes.POST("/forgot", password.ForgotPasswordHandler)
	passwordRoutes.PUT("/reset", password.ResetPasswordHandler)

	studyRoomRoutes := router.Group("/study-room")
	studyRoomRoutes.Use(middlewares.JWTValidationMiddleware())
	studyRoomRoutes.POST("/create", study_room.CreateStudyRoomHandler)
	studyRoomRoutes.DELETE("/delete", study_room.DeleteStudyRoomHandler)
	studyRoomRoutes.GET("/join/:roomCode", study_room.JoinStudyRoomHandler)

	worksRoutes := router.Group("/works")
	studyRoomRoutes.Use(middlewares.JWTValidationMiddleware())
	worksRoutes.POST("/add", works.AddWorkHandler)
	worksRoutes.GET("/get", works.GetWorksHandler)
	worksRoutes.DELETE("/delete", works.DeleteWorkHandler)
	worksRoutes.POST("/log", works.LogWorkHandler)
	worksRoutes.GET("/log", works.GetWorkLogsHandler)

	reportsRoutes := router.Group("/reports")
	reportsRoutes.Use(middlewares.JWTValidationMiddleware())
	reportsRoutes.POST("/submit", reports.SubmitReportsHandler)

	friendsRoutes := router.Group("/friends")
	friendsRoutes.Use(middlewares.JWTValidationMiddleware())
	friendsRoutes.POST("/request/send", friends.SendFriendRequestHandler)
	friendsRoutes.DELETE("/delete", friends.DeleteFriendshipHandler)
	friendsRoutes.GET("/get", friends.GetFriendsHandler)

	buildingsRoutes := router.Group("/buildings")
	buildingsRoutes.Use(middlewares.JWTValidationMiddleware())
	buildingsRoutes.GET("/get-own", buildings.GetOwnBuildingsHandler)
	buildingsRoutes.GET("/get-town", buildings.GetTownBuildingsHandler)
	buildingsRoutes.GET("/get-store", buildings.GetNonOwnedBuildingsInStoreHandler)
	buildingsRoutes.POST("/build", buildings.BuildBuildingsHandler)

	storeRoutes := router.Group("/store")
	storeRoutes.Use(middlewares.JWTValidationMiddleware())
	storeRoutes.POST("/buy-building", buildings.BuyBuildingHandler)
	storeRoutes.POST("/buy-character", characters.BuyCharacterHandler)

	charactersRoutes := router.Group("/characters")
	charactersRoutes.Use(middlewares.JWTValidationMiddleware())
	charactersRoutes.POST("/set-as-main", characters.SetAsMainCharacterHandler)
	charactersRoutes.GET("/get-own", characters.GetOwnCharactersHandler)
	charactersRoutes.GET("/get-store", characters.GetNonOwnedCharactersInStoreHandler)

	adminGroup := router.Group("/admin")
	adminGroup.Use(middlewares.AdminJWTValidationMiddleware())
	adminGroup.POST("/buildings/set-in-store", admin.SetBuildingsInStoreHandler)
	adminGroup.POST("/characters/set-in-store", admin.SetCharactersInStoreHandler)

	backendPort := os.Getenv("BACKEND_PORT")
	router.Run(":" + backendPort)
}
