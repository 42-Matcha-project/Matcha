package admin

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
	"time"
)

func setBuildingsInStore(setBuildingsInStoreInput SetBuildingsInStoreInput) error {
	/*
		DBに建物を保存する関数
	*/
	for _, inputBuilding := range setBuildingsInStoreInput.Buildings {
		var err error
		inputBuilding.SaleStartTime, err = utils.ConvertToMyTimeZone(inputBuilding.SaleStartTime)
		if err != nil {
			return err
		}
		inputBuilding.SaleEndTime, err = utils.ConvertToMyTimeZone(inputBuilding.SaleEndTime)
		if err != nil {
			return err
		}

		building := &models.TBuilding{
			ExteriorImageURL:  inputBuilding.ExteriorImageURL,
			InteriorImageURL:  inputBuilding.InteriorImageURL,
			DefaultName:       inputBuilding.DefaultName,
			CustomName:        "",
			RequiredCoinCount: inputBuilding.RequiredCoinCount,
			IsInStore:         utils.IsOnSale(inputBuilding.SaleStartTime, inputBuilding.SaleEndTime),
			SaleStartTime:     utils.ConvertToNullTime(inputBuilding.SaleStartTime),
			SaleEndTime:       utils.ConvertToNullTime(inputBuilding.SaleEndTime),
		}

		err = models.DB.Create(building).Error
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
	ExteriorImageURL  string    `json:"ExteriorImageUrl" binding:"required"`
	InteriorImageURL  string    `json:"InteriorImageUrl" binding:"required"`
	DefaultName       string    `json:"DefaultName" binding:"required"`
	RequiredCoinCount int       `json:"RequiredCoinCount" binding:"required"`
	SaleStartTime     time.Time `json:"SaleStartTime"`
	SaleEndTime       time.Time `json:"SaleEndTime"`
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
