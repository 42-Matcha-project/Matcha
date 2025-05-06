package buildings

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
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
		Find(&townBuildings).Error

	return townBuildings, err
}

func GetTownBuildingsHandler(reqContext *gin.Context) {
	/*
		現在町に建っている建物一覧を取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	townBuildings, err := GetTownBuildings(*user)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetBuildings, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetBuildings, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.GetTownBuildingsSuccess, applogs.CreateJSONResponseByResponseCode(applogs.GetTownBuildingsSuccess, applogs.ResponseOptions{UserBuildings: models.ConvertToUserBuildingInfos(townBuildings)}))
}
