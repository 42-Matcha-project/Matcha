package friends

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	var sendFriendRequestInput SendFriendRequestInput
	if err := reqContext.ShouldBind(&sendFriendRequestInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	if user.ID == sendFriendRequestInput.ReceiverID {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Cannot send to yourself"})
		reqContext.Error(err)
		return
	}

	var friendship models.TFriendship
	err = models.DB.Where("requester_id = ? AND receiver_id = ?", user.ID, sendFriendRequestInput.ReceiverID).First(&friendship).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) && err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in getting friendship"})
		reqContext.Error(err)
		return
	} else if err == nil {
		reqContext.JSON(http.StatusOK, gin.H{"Friendship": friendship})
		return
	}

	var reverseFriendship models.TFriendship
	err = models.DB.Where("requester_id = ? AND receiver_id = ?", sendFriendRequestInput.ReceiverID, user.ID).First(&reverseFriendship).Error
	if !errors.Is(err, gorm.ErrRecordNotFound) && err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in getting friendship"})
		reqContext.Error(err)
		return
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		returnFriendship, err := sendFriendRequest(user.ID, sendFriendRequestInput.ReceiverID)
		if err != nil {
			reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in sending friendship"})
			reqContext.Error(err)
			return
		}

		reqContext.JSON(http.StatusOK, gin.H{"Friendship": returnFriendship})
		return
	}

	returnFriendship, err := acceptFriendRequest(reverseFriendship)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in accepting friendship"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"Friendship": returnFriendship})
}
