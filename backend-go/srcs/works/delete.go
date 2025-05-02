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
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	var deleteWorkInput DeleteWorkInput
	err = reqContext.ShouldBindJSON(&deleteWorkInput)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	err = deleteWork(deleteWorkInput.WorkID, *user)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToDeleteWork, applogs.CreateJSONResponseByResponseCode(applogs.FailedToDeleteWork, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.DeleteWorkSuccess, applogs.CreateJSONResponseByResponseCode(applogs.DeleteWorkSuccess, applogs.ResponseOptions{}))
}
