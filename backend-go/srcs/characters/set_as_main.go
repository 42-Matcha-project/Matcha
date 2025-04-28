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
	CharacterID int `json:"CharacterID"`
}

func SetAsMainCharacterHandler(reqContext *gin.Context) {
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var setMainCharacterInput SetAsMainCharacterInput
	err = reqContext.ShouldBindJSON(&setMainCharacterInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if isOwned, err := user.IsCharacterIDOwned(setMainCharacterInput.CharacterID); !isOwned && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if !isOwned {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.CharacterNotOwned, applogs.ResponseOptions{}))
		return
	}

	err = setAsMainCharacter(user, setMainCharacterInput.CharacterID)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToUpdateUserCharacter, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.SetAsMainCharacterSuccess, applogs.ResponseOptions{}))
}
