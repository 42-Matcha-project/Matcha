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
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	var buyCharacterInput BuyCharacterInput
	err = reqContext.ShouldBindJSON(&buyCharacterInput)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	if isCharacterOwned, err := user.IsCharacterIDOwned(buyCharacterInput.CharacterID); !isCharacterOwned && err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetCharacter, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetCharacter, applogs.ResponseOptions{}))
		return
	} else if isCharacterOwned {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.CharacterAlreadyOwned, applogs.CreateJSONResponseByResponseCode(applogs.CharacterAlreadyOwned, applogs.ResponseOptions{}))
		return
	}

	if err, responseCode := buyCharacter(user, buyCharacterInput.CharacterID); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, responseCode, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, err, applogs.BuyCharacterSuccess, applogs.CreateJSONResponseByResponseCode(applogs.BuyCharacterSuccess, applogs.ResponseOptions{}))
}
