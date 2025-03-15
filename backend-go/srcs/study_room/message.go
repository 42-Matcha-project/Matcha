package study_room

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"srcs/models"
)

type SendMessageStruct struct {
	Type    string `json:"Type"`
	Sender  string `json:"Sender"`
	Message string `json:"Message"`
}

func SendMessage(message string, room *StudyRoom, user *models.TUser) error {
	/*
		自分以外のラウンジにいるクライアントにメッセージを送る
	*/
	sendMessageMessage := SendMessageStruct{
		Type:    "MESSAGE",
		Sender:  user.DisplayName,
		Message: message,
	}
	jsonSendMessage, _ := json.Marshal(sendMessageMessage)
	for _, client := range room.Clients {
		err := client.Conn.WriteMessage(websocket.TextMessage, jsonSendMessage)
		if err != nil {
			return err
		}
	}
	return nil
}
