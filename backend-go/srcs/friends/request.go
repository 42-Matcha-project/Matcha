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

func sendFriendRequest(requesterID int, receiverID int) (*models.TFriendship, error) {
	/*
		DBにフレンド申請を保存する関数
	*/
	friendship := &models.TFriendship{
		RequesterID: requesterID,
		ReceiverID:  receiverID,
		IsPending:   true,
	}

	err := models.DB.Create(friendship).Error
	return friendship, err
}

func acceptFriendRequest(reverseFriendship models.TFriendship) (*models.TFriendship, error) {
	/*
		フレンドリクエストを承認する関数
	*/
	reverseFriendship.IsPending = false

	err := models.DB.Save(&reverseFriendship).Error
	return &reverseFriendship, err
}

type SendFriendRequestInput struct {
	/*
		フレンド申請リクエストに対するハンドラー関数
	*/
	ReceiverName string `json:"ReceiverName" binding:"required"`
}

func SendFriendRequestHandler(reqContext *gin.Context) {
	/*
		フレンド申請リクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var sendFriendRequestInput SendFriendRequestInput
	err = reqContext.ShouldBindJSON(&sendFriendRequestInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if user.Username == sendFriendRequestInput.ReceiverName {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.CannotFriendRequestYourself, applogs.ResponseOptions{}))
		return
	}

	var receiver models.TUser
	err = models.DB.Where("username = ?", sendFriendRequestInput.ReceiverName).First(&receiver).Error
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.OtherUserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetUser, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var friendship models.TFriendship
	err = models.DB.Where("requester_id = ? AND receiver_id = ?", user.ID, receiver.ID).First(&friendship).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetFriendship, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if err == nil {
		reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.FriendRequestAlreadySent, applogs.ResponseOptions{}))
		return
	}

	var reverseFriendship models.TFriendship
	err = models.DB.Where("requester_id = ? AND receiver_id = ?", receiver.ID, user.ID).First(&reverseFriendship).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetFriendship, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		returnFriendship, err := sendFriendRequest(user.ID, receiver.ID)
		if err != nil {
			reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCreateFriendship, applogs.ResponseOptions{}))
			reqContext.Error(err)
			return
		}

		reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.SendFriendRequestSuccess, applogs.ResponseOptions{Friendship: returnFriendship}))
		return
	}

	returnFriendship, err := acceptFriendRequest(reverseFriendship)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCreateFriendship, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.FriendRequestAcceptSuccess, applogs.ResponseOptions{Friendship: returnFriendship}))
}
