package study_room

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"os"
)

type ReceivedMessage struct {
	Type   string `json:"Type" binding:"required"`
	Conent string `json:"Conent" default:""`
}

const (
	Success Status = iota
	Warning
	FatalError
)

type Status int

func ReceiveMessage(reqContext *gin.Context, conn *websocket.Conn) (ReceivedMessage, Status) {
	var receivedMessage ReceivedMessage

	_, message, err := conn.ReadMessage()
	if err != nil {
		reqContext.Error(err)
		return receivedMessage, FatalError
	}

	if os.Getenv("ENVIRONMENT") == "development" {
		fmt.Println(message)
	}

	if err := json.Unmarshal(message, &receivedMessage); err != nil {
		reqContext.Error(err)
		return receivedMessage, Warning
	}

	return receivedMessage, Success
}
