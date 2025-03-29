package admin

import (
	"github.com/gin-gonic/gin"
	"net/http"
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
			IsInStore:         inputBuilding.IsInStore,
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
	IsInStore         bool      `json:"IsInStore" binding:"required"`
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	err := setBuildingsInStore(setBuildingsInStoreInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in setting buildings"})
		reqContext.Error(err)
		return
	}

	reqContext.Status(http.StatusOK)
}
