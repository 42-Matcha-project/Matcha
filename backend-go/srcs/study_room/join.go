package study_room

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024, // メッセージのサイズを見て再設定
	WriteBufferSize: 1024, // 上に同じ
	CheckOrigin: func(request *http.Request) bool {
		return true
	},
}

func joinStudyRoom(room *StudyRoom, user *models.TUser, conn *websocket.Conn) {
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
			Status:   "Online",
			IsHost:   false,
			Conn:     conn,
		}
		room.Clients[user.ID] = newClient
	}
}

func JoinStudyRoomHandler(reqContext *gin.Context) {
	/*
		自習室参加リクエストを処理するハンドラー
	*/

	// roomCodeをパラメータから取得し、roomを設定する
	roomCode := reqContext.Param("roomCode")
	StudyRoomsMutex.Lock()
	if _, isExist := StudyRooms[roomCode]; !isExist {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "room code not exist"})
		return
	}
	room := StudyRooms[roomCode]
	StudyRoomsMutex.Unlock()

	// JWTトークンからuserIdを抽出し、userをDBから取り出す。
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		reqContext.Error(err)
		return
	}

	// Websocketへupgradeする。
	conn, err := upgrader.Upgrade(reqContext.Writer, reqContext.Request, nil)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		reqContext.Error(err)
		return
	}
	defer conn.Close()

	// ユーザー参加の処理をする(Clientsに追加)
	room.Mutex.Lock()
	joinStudyRoom(room, user, conn)

	// 自分以外のユーザーのクライアントリストを作成し、自分自身に送る。
	err = BroadcastClientsList(room.Clients)
	if err != nil {
		reqContext.Error(err)
		delete(room.Clients, user.ID)
		room.Mutex.Unlock()
		return
	}
	room.Mutex.Unlock()

	// メッセージ待機するfor文
	for {
		receivedMessage, status := ReceiveMessage(reqContext, conn)
		if status == FatalError {
			room.Mutex.Lock()
			delete(room.Clients, user.ID)
			err = BroadcastClientsList(room.Clients)
			if err != nil {
				reqContext.Error(err)
			}
			room.Mutex.Unlock()
			return
		} else if status == Warning {
			continue
		}

		// メッセージタイプがSTATUSならオンオフラインの切り替え、EXITなら退出処理を行う。
		room.Mutex.Lock()
		err = HandleUserAction(receivedMessage, room, user)
		if err != nil {
			reqContext.Error(err)
			room.Mutex.Unlock()
			return
		}
		room.Mutex.Unlock()
	}
}
