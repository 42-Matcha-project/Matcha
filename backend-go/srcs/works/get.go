package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
)

func getWorks(user models.TUser) ([]models.TWork, error) {
	/*
		DBからリクエストを送っているユーザーの作業一覧を取得する関数
	*/
	var works []models.TWork
	err := models.DB.Where("user_id = ?", user.ID).Find(&works).Error
	return works, err
}

func GetWorksHandler(reqContext *gin.Context) {
	/*
		作業一覧を取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	works, err := getWorks(*user)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetWork, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.GetWorksSuccess, applogs.ResponseOptions{Works: models.ConvertToWorkInfos(works)}))
}
