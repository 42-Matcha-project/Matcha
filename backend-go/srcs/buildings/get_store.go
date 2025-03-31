package buildings

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
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
	fmt.Println("buildingsInStore", buildingsInStore)
	fmt.Println("!!!!!!!!!!!!!!!!!!!!!")

	ownBuildings, err := GetOwnBuildings(user)
	if err != nil {
		return nil, err
	}
	fmt.Println("ownBuildings", ownBuildings)

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
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	nonOwnedBuildingsInStore, err := getNonOwnedBuildingsInStore(*user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in getting store buildings"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"Buildings": nonOwnedBuildingsInStore})
}
