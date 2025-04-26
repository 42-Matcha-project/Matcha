package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

type DeleteWorkInput struct {
	WorkID int `json:"WorkID" binding:"required"`
}

func deleteWork(workIDToDelete int, user models.TUser) error {
	err := models.DB.Delete(&models.TWork{}, workIDToDelete).Error
	return err
}

func DeleteWorkHandler(reqContext *gin.Context) {
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var deleteWorkInput DeleteWorkInput
	err = reqContext.ShouldBindJSON(&deleteWorkInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err = deleteWork(deleteWorkInput.WorkID, *user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToDeleteWork, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.DeleteWorkSuccess, applogs.ResponseOptions{}))
}
