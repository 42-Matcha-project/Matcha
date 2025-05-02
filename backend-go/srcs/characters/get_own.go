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
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	characters, err := GetOwnCharacters(*user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.GetOwnCharactersSuccess, applogs.ResponseOptions{UserCharacters: models.ConvertToUserCharacterInfos(characters)}))
}
