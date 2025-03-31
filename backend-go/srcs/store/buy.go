package store

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

func BuyBuilding(user *models.TUser, buildingID int) error {
	var building models.TBuilding
	err := models.DB.Where("id = ?", buildingID).First(&building).Error
	if err != nil {
		return err
	}

	err = user.DeductCoins(building.RequiredCoinCount)
	if err != nil {
		return err
	}

	userBuilding := &models.TUserBuilding{
		UserID:     user.ID,
		BuildingID: buildingID,
		PlaceIndex: 0,
	}

	err = models.DB.Create(&userBuilding).Error
	return err
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	var buyBuildingInput BuyBuildingInput
	if err := reqContext.ShouldBindJSON(&buyBuildingInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	if isBuildingOwned, err := user.IsBuildingIDOwned(buyBuildingInput.BuildingID); !isBuildingOwned && err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in checking user ownership"})
		reqContext.Error(err)
		return
	} else if isBuildingOwned {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "The building ID is owned"})
	}

	if err := BuyBuilding(user, buyBuildingInput.BuildingID); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in buying building"})
		reqContext.Error(err)
		return
	}

	reqContext.Status(http.StatusOK)
}
