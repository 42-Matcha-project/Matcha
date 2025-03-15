package study_room

import (
	"fmt"
	"os"
	"srcs/models"
)

func HandleUserAction(receivedMessage ReceivedMessage, room *StudyRoom, user *models.TUser) error {
	if receivedMessage.Type == "STATUS" {
		if receivedMessage.Content == "Online" {
			room.Clients[user.ID].Status = "Online"
		} else if receivedMessage.Content == "Offline" {
			room.Clients[user.ID].Status = "Offline"
		} else if receivedMessage.Content == "Lounge" {
			room.Clients[user.ID].Status = "Lounge"
		}
		err := BroadcastClientsList(room.Clients)
		if err != nil {
			delete(room.Clients, user.ID)
			return err
		}
	} else if receivedMessage.Type == "MESSAGE" {
		err := SendMessage(receivedMessage.Content, room, user)
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
