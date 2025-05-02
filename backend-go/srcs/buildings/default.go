package buildings

import (
	"encoding/json"
	"log"
	"os"
	"srcs/models"
)

func BuildDefaultBuilding(user models.TUser) error {
	/*
		デフォルトの建物を建てる関数
	*/
	userBuilding := &models.TUserBuilding{
		UserID:     user.ID,
		BuildingID: 1,
		PlaceIndex: 1,
	}

	if err := models.DB.Create(userBuilding).Error; err != nil {
		return err
	}

	return nil
}

type BuildingJSON struct {
	ExteriorImageURL  string `json:"ExteriorImageURL"`
	InteriorImageURL  string `json:"InteriorImageURL"`
	DefaultName       string `json:"DefaultName"`
	RequiredCoinCount int    `json:"RequiredCoinCount"`
	IsInStore         bool   `json:"IsInStore"`
}

func SetDefaultBuildingInStore() {
	/*
		デフォルトの建物をストアにセットする関数
	*/
	var err error
	if err = models.DB.Where("id = ?", 1).First(&models.TBuilding{}).Error; err == nil {
		return
	}

	defaultBuidingFile, err := os.Open("./json_data/buildings/default.json")
	if err != nil {
		log.Fatal("Error opening file:", err)
	}
	defer defaultBuidingFile.Close()

	var buildingData BuildingJSON
	err = json.NewDecoder(defaultBuidingFile).Decode(&buildingData)
	if err != nil {
		log.Fatal("Error decoding JSON:", err)
	}

	building := &models.TBuilding{
		ExteriorImageURL:  buildingData.ExteriorImageURL,
		InteriorImageURL:  buildingData.InteriorImageURL,
		DefaultName:       buildingData.DefaultName,
		RequiredCoinCount: buildingData.RequiredCoinCount,
		IsInStore:         buildingData.IsInStore,
	}
	if err := models.DB.Create(building).Error; err != nil {
		log.Fatal("Error creating building:", err)
	}
}
