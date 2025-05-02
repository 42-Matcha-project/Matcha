package admin

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
)

func setBuildingsInStore(setBuildingsInStoreInput SetBuildingsInStoreInput) error {
	/*
		DBに建物を保存する関数
	*/
	for _, inputBuilding := range setBuildingsInStoreInput.Buildings {
		building := &models.TBuilding{
			ExteriorImageURL:  inputBuilding.ExteriorImageURL,
			InteriorImageURL:  inputBuilding.InteriorImageURL,
			DefaultName:       inputBuilding.DefaultName,
			RequiredCoinCount: inputBuilding.RequiredCoinCount,
			IsInStore:         inputBuilding.IsInStore,
		}

		err := models.DB.Create(building).Error
		if err != nil {
			return err
		}
	}
	return nil
}

type BuildingInfo struct {
	/*
		管理者がストアに建物をセットするリクエスト時に抽出するJSONデータの構造体
	*/
	ExteriorImageURL  string `json:"ExteriorImageUrl" binding:"required"`
	InteriorImageURL  string `json:"InteriorImageUrl" binding:"required"`
	DefaultName       string `json:"DefaultName" binding:"required"`
	RequiredCoinCount int    `json:"RequiredCoinCount" binding:"required"`
	IsInStore         bool   `json:"IsInStore" binding:"required"`
}

type SetBuildingsInStoreInput struct {
	Buildings []BuildingInfo `json:"Buildings"`
}

func SetBuildingsInStoreHandler(reqContext *gin.Context) {
	/*
		管理者がストアに建物をセットするリクエストに対するハンドラー関数
	*/
	var setBuildingsInStoreInput SetBuildingsInStoreInput
	if err := reqContext.ShouldBindJSON(&setBuildingsInStoreInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err := setBuildingsInStore(setBuildingsInStoreInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCreateBuilding, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.SetBuildingsInStoreSuccess, applogs.ResponseOptions{}))
}

func setCharactersInStore(setCharactersInStoreInput SetCharacterInStoreInput) error {
	for _, inputCharacter := range setCharactersInStoreInput.Characters {
		character := &models.TCharacter{
			ImageURL:          inputCharacter.ImageURL,
			DefaultName:       inputCharacter.DefaultName,
			RequiredCoinCount: inputCharacter.RequiredCoinCount,
			IsInStore:         inputCharacter.IsInStore,
		}
		err := models.DB.Create(character).Error
		if err != nil {
			return err
		}
	}
	return nil
}

type CharacterInfo struct {
	ImageURL          string `json:"ImageUrl" binding:"required"`
	DefaultName       string `json:"DefaultName" binding:"required"`
	RequiredCoinCount int    `json:"RequiredCoinCount" binding:"required"`
	IsInStore         bool   `json:"IsInStore" binding:"required"`
}

type SetCharacterInStoreInput struct {
	Characters []CharacterInfo `json:"Characters"`
}

func SetCharactersInStoreHandler(reqContext *gin.Context) {
	var setCharactersInStoreInput SetCharacterInStoreInput
	if err := reqContext.ShouldBindJSON(&setCharactersInStoreInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err := setCharactersInStore(setCharactersInStoreInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCreateCharacter, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.SetCharactersInStoreSuccess, applogs.ResponseOptions{}))
}
