package study_room

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/token"
)

func deleteStudyRoomByHostId(hostId int) {
	for roomCode, room := range StudyRooms {
		if room.Host.UserID == hostId {
			delete(StudyRooms, roomCode)
			return
		}
	}
}

func DeleteStudyRoomHandler(reqContext *gin.Context) {
	/*
		自習室の削除リクエストに対するハンドラー関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"status": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}

	deleteStudyRoomByHostId(int(userId))
	reqContext.JSON(http.StatusOK, gin.H{"status": "Delete Success"})
}
