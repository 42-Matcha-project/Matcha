package buildings

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

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

func GetTownBuildingsHandler(reqContext *gin.Context) {
	/*
		現在町に建っている建物一覧を取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	townBuildings, err := GetTownBuildings(*user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in getting town buildings"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"TownBuildings": townBuildings})
}
