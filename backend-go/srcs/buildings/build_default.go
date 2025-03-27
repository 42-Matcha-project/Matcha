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
