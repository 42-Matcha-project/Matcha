package characters

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func GetMainCharacter(user models.TUser) (models.TCharacter, error) {
	var userCharacter models.TUserCharacter
	err := models.DB.
		Preload("Character").
		Where("t_user_id = ? AND is_main = ?", user.ID, true).First(&userCharacter).Error

	return userCharacter.Character, err
}

func GetOwnCharacters(user models.TUser) ([]models.TUserCharacter, error) {
	var ownCharacters []models.TUserCharacter
	err := models.DB.Preload("Character").
		Where("t_user_id = ?", user.ID).
		Find(&ownCharacters).Error

	return ownCharacters, err
}

func GetOwnCharactersHandler(reqContext *gin.Context) {
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	characters, err := GetOwnCharacters(*user)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetCharacter, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.GetOwnCharactersSuccess, applogs.CreateJSONResponseByResponseCode(applogs.GetOwnCharactersSuccess, applogs.ResponseOptions{UserCharacters: models.ConvertToUserCharacterInfos(characters)}))
}
