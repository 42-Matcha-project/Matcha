package buildings

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

func BuildBuildingAt(user models.TUser, buildingID int, placeIndex int) error {
	/*
		指定すれたインデックスにすでに建物があれば撤去し、
		指定されたインデックスに建物を建てる。
	*/
	townBuildings, err := GetTownBuildings(user)
	if err != nil {
		return err
	}

	userBuilding := &models.TUserBuilding{
		UserID:     user.ID,
		BuildingID: buildingID,
		PlaceIndex: placeIndex,
	}

	for _, townBuilding := range townBuildings {
		if townBuilding.PlaceIndex == placeIndex {
			err = models.DB.Delete(&townBuilding).Error
			if err != nil {
				return err
			}
		}
		if townBuilding.BuildingID == buildingID {
			err = models.DB.Delete(&townBuilding).Error
			if err != nil {
				return err
			}
		}
	}

	err = models.DB.Create(&userBuilding).Error
	return err
}

func buildBuildings(user models.TUser, buildingID int, placeIndex int) error {
	/*
		建物を建てる関数
		建物を所有しているか確認して、指定された場所インデックスに建てる。
	*/
	ownBuildings, err := GetOwnBuildings(user)
	if err != nil {
		return err
	}

	for _, ownBuilding := range ownBuildings {
		if ownBuilding.ID == buildingID {
			err = BuildBuildingAt(user, ownBuilding.ID, placeIndex)
			return err
		}
	}
	return errors.New(fmt.Sprint("building not found", buildingID))
}

type BuildBuildingsInput struct {
	/*
		建物を建てるリクエスト時に抽出するJSONデータの構造体
	*/
	BuildingID int `json:"BuildingID" binding:"required"`
	PlaceIndex int `json:"PlaceIndex" binding:"required"`
}

func BuildBuildingsHandler(reqContext *gin.Context) {
	/*
		建物を建てるリクエストに対するハンドラー関数。
		建物と場所インデックスを受け取ってDBを更新する。
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	var buildBuildingsInput BuildBuildingsInput
	err = reqContext.BindJSON(&buildBuildingsInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	err = buildBuildings(*user, buildBuildingsInput.BuildingID, buildBuildingsInput.PlaceIndex)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in building building"})
		reqContext.Error(err)
		return
	}

	reqContext.Status(http.StatusOK)
}
