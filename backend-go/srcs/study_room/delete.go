package study_room

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
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
		reqContext.JSON(http.StatusUnauthorized, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	StudyRoomsMutex.Lock()
	deleteStudyRoomByHostId(int(userId))
	StudyRoomsMutex.Unlock()
	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.DeleteStudyRoomSuccess, applogs.CreateJSONResponseByResponseCode(applogs.DeleteStudyRoomSuccess, applogs.ResponseOptions{}))
}
