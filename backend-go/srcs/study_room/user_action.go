package study_room

import (
	"fmt"
	"os"
	"srcs/models"
)

func HandleUserAction(receivedMessage ReceivedMessage, room *StudyRoom, user *models.TUser) error {
	if receivedMessage.Type == "STATUS" {
		room.Clients[user.ID].IsOnline = !room.Clients[user.ID].IsOnline
		err := BroadcastClientsList(room.Clients)
		if err != nil {
			delete(room.Clients, user.ID)
			return err
		}
	} else if receivedMessage.Type == "EXIT" {
		delete(room.Clients, user.ID)
		err := BroadcastClientsList(room.Clients)
		if err != nil {
			return err
		}
		return nil
	} else {
		if os.Getenv("ENVIRONMENT") == "development" {
			fmt.Println("Unknown Type Message")
		}
	}
	return nil
}
