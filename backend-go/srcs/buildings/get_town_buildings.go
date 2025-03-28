package buildings

import "srcs/models"

func GetTownBuildings(user models.TUser) ([]models.TUserBuilding, error) {
	/*
		現在町に建っている建物一覧を返す関数
	*/
	var townBuildings []models.TUserBuilding
	err := models.DB.Preload("Building").
		Where("t_user_id = ? AND place_index > ?", user.ID, 0).
		First(&townBuildings).Error

	return townBuildings, err
}
