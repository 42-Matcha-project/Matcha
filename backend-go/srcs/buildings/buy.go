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
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var buyBuildingInput BuyBuildingInput
	if err := reqContext.ShouldBindJSON(&buyBuildingInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if isBuildingOwned, err := user.IsBuildingIDOwned(buyBuildingInput.BuildingID); !isBuildingOwned && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetBuildings, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	} else if isBuildingOwned {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.BuildingAlreadyOwned, applogs.ResponseOptions{}))
		return
	}

	if err, responseCode := BuyBuilding(user, buyBuildingInput.BuildingID); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.BuyBuildingSuccess, applogs.ResponseOptions{}))
}
