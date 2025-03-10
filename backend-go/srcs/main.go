package main

import (
	"log"
	"net/http"
	"os"
	"srcs/auth"
	"srcs/models"
	"srcs/utils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)

func handleWebsocket(c *gin.Context) {
	//
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	clients[conn] = true
	log.Println("Websocket connected")

	for {
		// メッセージが来るまで待機
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			delete(clients, conn)
			break
		}

		log.Printf("Received message from client: %s\n", string(msg))

		// 自分を除いた全clientに送る
		for client := range clients {
			if client == conn {
				continue
			}
			err := client.WriteMessage(messageType, msg)
			if err != nil {
				log.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

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

	router.GET("/ws", handleWebsocket)

	router.Run(":8080")
}
