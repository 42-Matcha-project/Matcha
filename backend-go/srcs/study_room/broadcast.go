package study_room

import (
	"encoding/json"
	"github.com/gorilla/websocket"
)

type ClientsListMessage struct {
	Type    string `json:"Type"`
	Clients []User `json:"Clients"`
}

func BroadcastClientsList(clients map[int]*User) error {
	/*
		クライアントリストを作成して全クライアントに通知する関数。
	*/
	clientsListMessage := ClientsListMessage{
		Type:    "ClientsList",
		Clients: []User{},
	}
	for _, client := range clients {
		clientsListMessage.Clients = append(clientsListMessage.Clients, *client)
	}

	jsonClientsListMessage, _ := json.Marshal(clientsListMessage)
	for _, client := range clients {
		err := client.Conn.WriteMessage(websocket.TextMessage, jsonClientsListMessage)
		if err != nil {
			return err
		}
	}
	return nil
}
