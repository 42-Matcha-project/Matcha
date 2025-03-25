package study_room

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/token"
)

func deleteStudyRoomByHostId(hostId int) {
	for roomCode, room := range StudyRooms {
		room.Mutex.Lock()
		if _, IsExist := room.Clients[hostId]; IsExist {
			for _, client := range room.Clients {
				if client.Conn != nil {
					client.Conn.Close()
				}
			}
			delete(StudyRooms, roomCode)
			room.Mutex.Unlock()
			return
		}
		room.Mutex.Unlock()
	}
}

func DeleteStudyRoomHandler(reqContext *gin.Context) {
	/*
		自習室の削除リクエストに対するハンドラー関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"Error": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}

	StudyRoomsMutex.Lock()
	deleteStudyRoomByHostId(int(userId))
	StudyRoomsMutex.Unlock()
	reqContext.Status(http.StatusOK)
}
