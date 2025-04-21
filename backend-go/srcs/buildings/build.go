package buildings

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func BuildBuildingAt(user models.TUser, buildingID int, placeIndex int) (error, int) {
	/*
		指定すれたインデックスにすでに建物があれば撤去し、
		指定されたインデックスに建物を建てる。
	*/
	townBuildings, err := GetTownBuildings(user)
	if err != nil {
		return err, applogs.FailedToGetBuildings
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
				return err, applogs.FailedToDeleteBuilding
			}
		}
		if townBuilding.BuildingID == buildingID {
			err = models.DB.Delete(&townBuilding).Error
			if err != nil {
				return err, applogs.FailedToDeleteBuilding
			}
		}
	}

	err = models.DB.Create(&userBuilding).Error
	return err, applogs.FailedToCreateUserBuilding
}

func buildBuildings(user models.TUser, buildingID int, placeIndex int) (error, int) {
	/*
		建物を建てる関数
		建物を所有しているか確認して、指定された場所インデックスに建てる。
	*/
	ownBuildings, err := GetOwnBuildings(user)
	if err != nil {
		return err, applogs.FailedToGetBuildings
	}

	for _, ownBuilding := range ownBuildings {
		if ownBuilding.ID == buildingID {
			err, responseCode := BuildBuildingAt(user, ownBuilding.ID, placeIndex)
			return err, responseCode
		}
	}
	return errors.New(fmt.Sprint("building not found", buildingID)), applogs.UserDoesNotOwnBuilding
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
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var buildBuildingsInput BuildBuildingsInput
	err = reqContext.BindJSON(&buildBuildingsInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err, responseCode := buildBuildings(*user, buildBuildingsInput.BuildingID, buildBuildingsInput.PlaceIndex)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.BuildBuildingSuccess, applogs.ResponseOptions{}))
}
