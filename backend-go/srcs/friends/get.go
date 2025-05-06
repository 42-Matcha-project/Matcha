package friends

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func getFriends(userID int) ([]models.TUser, error) {
	/*
		DBからそのユーザーのフレンド一覧を取得する関数
	*/
	var friendships []models.TFriendship
	err := models.DB.Where("requester_id = ? OR receiver_id = ?", userID, userID).Find(&friendships).Error
	if err != nil {
		return nil, err
	}

	var friends []models.TUser
	for _, friendship := range friendships {
		userIDToSearch := friendship.RequesterID
		if userIDToSearch == userID {
			userIDToSearch = friendship.ReceiverID
		}

		var friend models.TUser
		err = models.DB.Where("ID = ?", userIDToSearch).First(&friend).Error
		if err != nil {
			return nil, err
		}
		friends = append(friends, friend)
	}

	return friends, nil
}

func GetFriendsHandler(reqContext *gin.Context) {
	/*
		フレンド一覧を取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	friends, err := getFriends(user.ID)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetFriendship, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetFriendship, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.GetFriendsSuccess, applogs.CreateJSONResponseByResponseCode(applogs.GetFriendsSuccess, applogs.ResponseOptions{Friends: models.ConvertToOtherUsersInfos(friends)}))
}
