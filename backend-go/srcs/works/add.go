package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/token"
)

type AddWorkInput struct {
	WorkName     string `json:"WorkName" binding:"required"`
	IconImageURL string `json:"IconImageURL"`
}

func addWork(addWorkInput AddWorkInput, user models.TUser) (*models.TWork, error) {
	/*
		作業内容をDBに保存する関数。
	*/
	work := &models.TWork{
		UserID:       user.ID,
		WorkName:     addWorkInput.WorkName,
		IconImageURL: addWorkInput.IconImageURL,
	}

	err := models.DB.Create(work).Error
	if err != nil {
		return nil, err
	}
	return work, nil
}

func AddWorkHandler(reqContext *gin.Context) {
	/*
		作業内容を追加するリクエストに対するハンドラー関数
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}
	user := &models.TUser{}
	err = models.DB.First(user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		reqContext.Error(err)
		return
	}

	var addWorkInput AddWorkInput
	err = reqContext.ShouldBindJSON(&addWorkInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to bind JSON"})
		reqContext.Error(err)
		return
	}

	work, err := addWork(addWorkInput, *user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to add work"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"work": work})
}
