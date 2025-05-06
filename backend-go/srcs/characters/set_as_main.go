package characters

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func setAsMainCharacter(user *models.TUser, characterID int) error {
	err := models.DB.Model(&models.TUserCharacter{}).
		Where("t_user_id = ? AND is_main = ?", user.ID, true).
		Updates(map[string]interface{}{"is_main": false}).Error
	if err != nil {
		return err
	}

	err = models.DB.Model(&models.TUserCharacter{}).
		Where("t_user_id = ? AND t_character_id = ?", user.ID, characterID).
		Updates(map[string]interface{}{"is_main": true}).Error
	return err
}

type SetAsMainCharacterInput struct {
	CharacterID int `json:"CharacterID" binding:"required"`
}

func SetAsMainCharacterHandler(reqContext *gin.Context) {
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	var setMainCharacterInput SetAsMainCharacterInput
	err = reqContext.ShouldBindJSON(&setMainCharacterInput)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	if isOwned, err := user.IsCharacterIDOwned(setMainCharacterInput.CharacterID); !isOwned && err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetCharacter, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		return
	} else if !isOwned {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, nil, applogs.CharacterNotOwned, applogs.CreateJSONResponseByResponseCode(applogs.CharacterNotOwned, applogs.ResponseOptions{}))
		return
	}

	err = setAsMainCharacter(user, setMainCharacterInput.CharacterID)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToUpdateUserCharacter, applogs.CreateJSONResponseByResponseCode(applogs.FailedToUpdateUserCharacter, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.SetAsMainCharacterSuccess, applogs.CreateJSONResponseByResponseCode(applogs.SetAsMainCharacterSuccess, applogs.ResponseOptions{}))
}
