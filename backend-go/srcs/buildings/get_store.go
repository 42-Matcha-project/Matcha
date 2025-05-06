package buildings

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func getBuildingsInStore() ([]models.TBuilding, error) {
	/*
		ストアで販売中の建物一覧を返す。
	*/
	var storeBuildings []models.TBuilding
	err := models.DB.Where("is_in_store = true").Find(&storeBuildings).Error

	return storeBuildings, err
}

func getNonOwnedBuildingsInStore(user models.TUser) ([]models.TBuilding, error) {
	/*
		ストアで販売中の建物一覧を返す。
	*/
	buildingsInStore, err := getBuildingsInStore()
	if err != nil {
		return nil, err
	}

	ownBuildings, err := GetOwnBuildings(user)
	if err != nil {
		return nil, err
	}

	for _, ownBuilding := range ownBuildings {
		buildingsInStore = utils.RemoveElementFromTBuilding(buildingsInStore, ownBuilding.ID)
	}

	return buildingsInStore, nil
}

func GetNonOwnedBuildingsInStoreHandler(reqContext *gin.Context) {
	/*
		ストアで販売中の建物一覧を取得するリクエストに対するハンドラー関数
		ユーザーがすでに所有している建物を除く。
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	nonOwnedBuildingsInStore, err := getNonOwnedBuildingsInStore(*user)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGetBuildings, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetBuildings, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.GetNonOwnedBuildingsInStoreSuccess, applogs.CreateJSONResponseByResponseCode(applogs.GetNonOwnedBuildingsInStoreSuccess, applogs.ResponseOptions{Buildings: models.ConvertToBuildingInfos(nonOwnedBuildingsInStore)}))
}
