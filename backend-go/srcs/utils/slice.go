package utils

import (
	"srcs/models"
)

func RemoveElementFromTCharacter(characters []models.TCharacter, removeCharacterID int) []models.TCharacter {
	removeKey := -1

	for key, character := range characters {
		if character.ID == removeCharacterID {
			removeKey = key
			break
		}
	}

	if removeKey == -1 {
		return characters
	}

	return append(characters[:removeKey], characters[removeKey+1:]...)
}

func RemoveElementFromTBuilding(buildings []models.TBuilding, removeBuildingID int) []models.TBuilding {
	/*
		指定されたkeyの要素をスライスから削除する関数
	*/
	removeKey := -1

	for key, building := range buildings {
		if building.ID == removeBuildingID {
			removeKey = key
			break
		}
	}

	if removeKey == -1 {
		return buildings
	}
	return append(buildings[:removeKey], buildings[removeKey+1:]...)
}
