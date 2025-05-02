package characters

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func getCharactersInStore() ([]models.TCharacter, error) {
	var storeCharacters []models.TCharacter
	err := models.DB.Where("is_in_store = true").Find(&storeCharacters).Error

	return storeCharacters, err
}

func GetNonOwnedCharactersInStore(user models.TUser) ([]models.TCharacter, error) {
	charactersInStore, err := getCharactersInStore()
	if err != nil {
		return nil, err
	}

	ownCharacters, err := GetOwnCharacters(user)
	if err != nil {
		return nil, err
	}

	for _, ownCharacter := range ownCharacters {
		charactersInStore = utils.RemoveElementFromTCharacter(charactersInStore, ownCharacter.ID)
	}

	return charactersInStore, nil
}

func GetNonOwnedCharactersInStoreHandler(reqContext *gin.Context) {
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	nonOwnedCharactersInStore, err := GetNonOwnedCharactersInStore(*user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.GetNonOwnCharactersInStoreSuccess, applogs.ResponseOptions{Characters: models.ConvertToCharacterInfos(nonOwnedCharactersInStore)}))
}
