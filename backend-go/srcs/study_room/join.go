package study_room

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	"os"
	"srcs/models"
	"srcs/token"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024, // メッセージのサイズを見て再設定
	WriteBufferSize: 1024, // 上に同じ
	CheckOrigin: func(request *http.Request) bool {
		return true
	},
}

type ReceivedMessage struct {
	Type string `json:"Type"`
}

type JoinMessage struct {
	Type        string `json:"Type"`
	UserId      int    `json:"UserId"`
	UserName    string `json:"Username"`
	UserIconURL string `json:"UserIconUrl"`
}

type ClientsListMessage struct {
	Type    string `json:"Type"`
	Clients []User `json:"Clients"`
}

type ExitMessage struct {
	Type   string `json:"Type"`
	UserId int    `json:"UserId"`
}

func JoinStudyRoomHandler(reqContext *gin.Context) {
	/*
		自習室参加リクエストを処理するハンドラー
	*/
	roomCode := reqContext.Param("roomCode")
	StudyRoomMutex.Lock()
	if _, isExist := StudyRooms[roomCode]; !isExist {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "room code not exist"})
		return
	}
	room := StudyRooms[roomCode]
	StudyRoomMutex.Unlock()

	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}
	user := &models.TUser{}
	err = models.DB.First(user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		reqContext.Error(err)
		return
	}

	conn, err := upgrader.Upgrade(reqContext.Writer, reqContext.Request, nil)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		reqContext.Error(err)
		return
	}
	defer conn.Close()

	StudyRoomMutex.Lock()
	if _, ok := room.Clients[user.ID]; ok {
		if room.Clients[user.ID].IsHost {
			fmt.Println("Host JOIN")
			room.Clients[user.ID].Conn = conn
		} else {
			fmt.Println("Already joined")
		}
	} else {
		newClient := &User{
			UserId:   user.ID,
			Username: user.DisplayName,
			IconURL:  user.IconImageURL,
			IsOnline: true,
			IsHost:   false,
			Conn:     conn,
		}
		room.Clients[user.ID] = newClient
	}

	clientsListMessage := ClientsListMessage{
		Type:    "ClientsList",
		Clients: []User{},
	}
	for clientId, client := range room.Clients {
		if clientId == user.ID {
			continue
		}
		clientsListMessage.Clients = append(clientsListMessage.Clients, *client)
	}
	broadcastMessage, err := json.Marshal(clientsListMessage)
	if err != nil {
		reqContext.Error(err)
		room.Clients[user.ID].Conn.Close()
		delete(room.Clients, user.ID)
		return
	}
	err = room.Clients[user.ID].Conn.WriteMessage(websocket.TextMessage, broadcastMessage)
	if err != nil {
		reqContext.Error(err)
		room.Clients[user.ID].Conn.Close()
		delete(room.Clients, user.ID)
		reqContext.Error(err)
	}
	StudyRoomMutex.Unlock()

	joinMessage := JoinMessage{
		Type:        "JOIN",
		UserId:      user.ID,
		UserName:    user.DisplayName,
		UserIconURL: user.IconImageURL,
	}
	broadcastMessage, err = json.Marshal(joinMessage)
	if err != nil {
		reqContext.Error(err)
		room.Clients[user.ID].Conn.Close()
		delete(room.Clients, user.ID)
		return
	}
	StudyRoomMutex.Lock()
	for clientId, client := range room.Clients {
		if clientId == user.ID {
			continue
		}
		err = client.Conn.WriteMessage(websocket.TextMessage, broadcastMessage)
		if err != nil {
			reqContext.Error(err)
			client.Conn.Close()
			delete(room.Clients, clientId)
		}
	}
	StudyRoomMutex.Unlock()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			reqContext.Error(err)
			break
		}

		var receivedMessage ReceivedMessage
		if err := json.Unmarshal(message, &receivedMessage); err != nil {
			reqContext.Error(err)
			continue
		}

		if os.Getenv("ENVIRONMENT") == "development" {
			fmt.Println(receivedMessage.Type)
		}

		StudyRoomMutex.Lock()
		if receivedMessage.Type == "STATUS" {
			room.Clients[user.ID].IsOnline = !room.Clients[user.ID].IsOnline
			fmt.Println("Received Status")
		} else if receivedMessage.Type == "EXIT" {
			room.Clients[user.ID].Conn.Close()
			delete(room.Clients, user.ID)
			exitMessage := ExitMessage{
				Type:   "EXIT",
				UserId: user.ID,
			}
			broadcastMessage, err = json.Marshal(exitMessage)
			if err != nil {
				reqContext.Error(err)
				return
			}
			for _, client := range room.Clients {
				err = client.Conn.WriteMessage(websocket.TextMessage, broadcastMessage)
				if err != nil {
					reqContext.Error(err)
					return
				}
			}
			return
		}
		StudyRoomMutex.Unlock()
	}
}
