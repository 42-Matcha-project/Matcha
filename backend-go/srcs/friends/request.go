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
	ReceiverID int `json:"ReceiverID" binding:"required"`
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
	err = reqContext.ShouldBind(&sendFriendRequestInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if user.ID == sendFriendRequestInput.ReceiverID {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.CannotFriendRequestYourself, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var friendship models.TFriendship
	err = models.DB.Where("requester_id = ? AND receiver_id = ?", user.ID, sendFriendRequestInput.ReceiverID).First(&friendship).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetFriendship, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if err == nil {
		reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.FriendRequestAlreadySent, applogs.ResponseOptions{}))
		return
	}

	var reverseFriendship models.TFriendship
	err = models.DB.Where("requester_id = ? AND receiver_id = ?", sendFriendRequestInput.ReceiverID, user.ID).First(&reverseFriendship).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetFriendship, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		returnFriendship, err := sendFriendRequest(user.ID, sendFriendRequestInput.ReceiverID)
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
