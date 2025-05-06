package friends

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
	FriendNameToDelete string `json:"FriendNameToDelete" binding:"required"`
}

func DeleteFriendshipHandler(reqContext *gin.Context) {
	/*
		フレンド削除するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	var deleteFriendshipInput DeleteFriendshipInput
	if err := reqContext.ShouldBindJSON(&deleteFriendshipInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	var friendToDelete models.TUser
	err = models.DB.Where("username = ?", deleteFriendshipInput.FriendNameToDelete).First(&friendToDelete).Error
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.OtherUserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.OtherUserNotFound, applogs.ResponseOptions{}))
		return
	} else if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetUser, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetUser, applogs.ResponseOptions{}))
		return
	}

	err = deleteFriendship(user.ID, friendToDelete.ID)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToDeleteFriendship, applogs.CreateJSONResponseByResponseCode(applogs.FailedToDeleteFriendship, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.DeleteFriendshipSuccess, applogs.CreateJSONResponseByResponseCode(applogs.DeleteFriendshipSuccess, applogs.ResponseOptions{}))
}
