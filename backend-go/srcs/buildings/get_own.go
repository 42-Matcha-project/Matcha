package buildings

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func GetOwnBuildings(user models.TUser) ([]models.TBuilding, error) {
	/*
		DBからユーザーが所持している建物一覧を取得する関数
	*/
	err := models.DB.Preload("Buildings").First(&user, user.ID).Error

	return user.Buildings, err
}

func GetOwnBuildingsHandler(reqContext *gin.Context) {
	/*
		ユーザーが所持している建物一覧を取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	buildings, err := GetOwnBuildings(*user)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetBuildings, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetBuildings, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.GetOwnBuildingsSuccess, applogs.CreateJSONResponseByResponseCode(applogs.GetOwnBuildingsSuccess, applogs.ResponseOptions{Buildings: models.ConvertToBuildingInfos(buildings)}))
}
