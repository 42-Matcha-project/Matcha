package characters

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func buyCharacter(user *models.TUser, characterID int) (error, int) {
	var character models.TCharacter
	err := models.DB.Where("id = ?", characterID).First(&character).Error
	if err != nil {
		return err, applogs.FailedToGetCharacter
	}

	err = user.DeductCoins(character.RequiredCoinCount)
	if err != nil {
		return err, applogs.NotEnoughCoins
	}

	userCharacter := models.TUserCharacter{
		UserID:      user.ID,
		CharacterID: character.ID,
		IsMain:      false,
	}

	err = models.DB.Create(&userCharacter).Error
	return err, applogs.FailedToCreateCharacter
}

type BuyCharacterInput struct {
	CharacterID int `json:"CharacterID" form:"CharacterID" binding:"required"`
}

func BuyCharacterHandler(reqContext *gin.Context) {
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var buyCharacterInput BuyCharacterInput
	err = reqContext.ShouldBindJSON(&buyCharacterInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if isCharacterOwned, err := user.IsCharacterIDOwned(buyCharacterInput.CharacterID); !isCharacterOwned && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if isCharacterOwned {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.CharacterAlreadyOwned, applogs.ResponseOptions{}))
		return
	}

	if err, responseCode := buyCharacter(user, buyCharacterInput.CharacterID); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.BuyCharacterSuccess, applogs.ResponseOptions{}))
}
