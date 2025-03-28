package buildings

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

func getOwnBuildings(user models.TUser) ([]models.TBuilding, error) {
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	buildings, err := getOwnBuildings(*user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Error in getting own buildings"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"Buildings": buildings})
}
