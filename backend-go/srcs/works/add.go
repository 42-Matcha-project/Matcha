package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
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
	return work, err
}

func AddWorkHandler(reqContext *gin.Context) {
	/*
		作業内容を追加するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var addWorkInput AddWorkInput
	err = reqContext.ShouldBindJSON(&addWorkInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	work, err := addWork(addWorkInput, *user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCreateWork, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.AddWorkSuccess, applogs.ResponseOptions{Work: work}))
}
