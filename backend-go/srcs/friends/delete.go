package friends

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func deleteFriendship(userID int, userIDToDelete int) error {
	/*
		DBから該当するFriendshipを削除する関数
	*/
	err := models.DB.Where("requester_id = ? AND receiver_id = ?", userID, userIDToDelete).
		Delete(&models.TFriendship{}).Error
	if err == nil {
		return nil
	}

	err = models.DB.Where("requester_id = ? AND receiver_id = ?", userIDToDelete, userID).
		Delete(&models.TFriendship{}).Error

	return err
}

type DeleteFriendshipInput struct {
	/*
		フレンド削除するリクエスト時に抽出するJSONデータの構造体
	*/
	FriendIDToDelete int `json:"FriendIDToDelete" binding:"required"`
}

func DeleteFriendshipHandler(reqContext *gin.Context) {
	/*
		フレンド削除するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var deleteFriendshipInput DeleteFriendshipInput
	if err := reqContext.ShouldBindJSON(&deleteFriendshipInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err = deleteFriendship(user.ID, deleteFriendshipInput.FriendIDToDelete)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToDeleteFriendship, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.DeleteFriendshipSuccess, applogs.ResponseOptions{}))
}
