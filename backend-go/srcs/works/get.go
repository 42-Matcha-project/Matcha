package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/token"
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
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}
	user := &models.TUser{}
	err = models.DB.First(user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		reqContext.Error(err)
		return
	}

	works, err := getWorks(*user)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"works": works})
}
