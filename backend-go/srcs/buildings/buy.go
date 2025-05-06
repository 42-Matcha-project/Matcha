package buildings

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func BuyBuilding(user *models.TUser, buildingID int) (error, int) {
	var building models.TBuilding
	err := models.DB.Where("id = ?", buildingID).First(&building).Error
	if err != nil {
		return err, applogs.FailedToGetBuildings
	}

	err = user.DeductCoins(building.RequiredCoinCount)
	if err != nil {
		return err, applogs.NotEnoughCoins
	}

	userBuilding := &models.TUserBuilding{
		UserID:     user.ID,
		BuildingID: buildingID,
		PlaceIndex: 0,
	}

	err = models.DB.Create(&userBuilding).Error
	return err, applogs.FailedToCreateUserBuilding
}

type BuyBuildingInput struct {
	BuildingID int `json:"BuildingID" binding:"required"`
}

func BuyBuildingHandler(reqContext *gin.Context) {
	/*
		建物を購入するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	var buyBuildingInput BuyBuildingInput
	if err := reqContext.ShouldBindJSON(&buyBuildingInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	if isBuildingOwned, err := user.IsBuildingIDOwned(buyBuildingInput.BuildingID); !isBuildingOwned && err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetBuildings, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetBuildings, applogs.ResponseOptions{}))
		return
	} else if isBuildingOwned {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, nil, applogs.BuildingAlreadyOwned, applogs.CreateJSONResponseByResponseCode(applogs.BuildingAlreadyOwned, applogs.ResponseOptions{}))
		return
	}

	if err, responseCode := BuyBuilding(user, buyBuildingInput.BuildingID); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, responseCode, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.BuyBuildingSuccess, applogs.CreateJSONResponseByResponseCode(applogs.BuyBuildingSuccess, applogs.ResponseOptions{}))
}
