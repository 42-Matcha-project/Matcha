package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

func getWorkLogs(user models.TUser) ([]models.TWorkLog, error) {
	/*
		リクエストを送っているユーザーの作業ログ一覧をDBから取得する関数
		StartAtが新しい順に10件まで取得する。
	*/
	var workLogs []models.TWorkLog
	err := models.DB.Where("user_id = ?", user.ID).
		Order("start_at DESC").
		Limit(10).
		Find(&workLogs).Error
	return workLogs, err
}

func GetWorkLogsHandler(reqContext *gin.Context) {
	/*
		作業ログを取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	workLogs, err := getWorkLogs(*user)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to get work logs"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"WorkLogs": workLogs})
}
