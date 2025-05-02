package characters

import (
	"encoding/json"
	"log"
	"os"
	"srcs/models"
)

func GetDefaultCharacter(user models.TUser) error {
	userCharacter := &models.TUserCharacter{
		UserID:      user.ID,
		CharacterID: 1,
		IsMain:      true,
	}

	err := models.DB.Create(userCharacter).Error
	return err
}

type CharacterJSON struct {
	ImageURL          string `json:"ImageURL"`
	DefaultName       string `json:"DefaultName"`
	RequiredCoinCount int    `json:"RequiredCoinCount"`
	IsInStore         bool   `json:"IsInStore"`
}

func SetDefaultCharacterInStore() {
	var err error
	if err = models.DB.Where("id = ?", 1).First(&models.TCharacter{}).Error; err == nil {
		return
	}

	defaultCharacterFile, err := os.Open("./json_data/characters/default.json")
	if err != nil {
		log.Fatal("Error opening file:", err)
	}
	defer defaultCharacterFile.Close()

	var characterData CharacterJSON
	err = json.NewDecoder(defaultCharacterFile).Decode(&characterData)
	if err != nil {
		log.Fatal("Error decoding JSON:", err)
	}

	character := &models.TCharacter{
		ImageURL:          characterData.ImageURL,
		DefaultName:       characterData.DefaultName,
		RequiredCoinCount: characterData.RequiredCoinCount,
		IsInStore:         characterData.IsInStore,
	}
	if err := models.DB.Create(character).Error; err != nil {
		log.Fatal("Error creating character:", err)
	}
}
