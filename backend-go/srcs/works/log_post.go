package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/coins"
	"srcs/models"
	"srcs/utils"
	"time"
)

type LogWorkInput struct {
	WorkID  int       `json:"WorkID" binding:"required"`
	StartAt time.Time `json:"StartAt"`
	Minutes int64     `json:"Minutes" binding:"required"`
}

func logWork(logWorkInput LogWorkInput, user models.TUser) (*models.TWorkLog, error) {
	/*
		作業ログをDBに保存する関数。
		StartAtが無ければMinutesから時刻を計算する
	*/
	if logWorkInput.StartAt.IsZero() {
		timeZone := os.Getenv("TIME_ZONE")
		location, err := time.LoadLocation(timeZone)
		if err != nil {
			return nil, err
		}
		logWorkInput.StartAt = time.Now().In(location).Add(-time.Duration(logWorkInput.Minutes) * time.Minute)
	}
	workLog := &models.TWorkLog{
		UserID:  user.ID,
		WorkID:  logWorkInput.WorkID,
		StartAt: logWorkInput.StartAt,
		Minutes: logWorkInput.Minutes,
	}

	err := models.DB.Create(workLog).Error
	return workLog, err
}

func LogWorkHandler(reqContext *gin.Context) {
	/*
		作業ログを記録するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	var logWorkInput LogWorkInput
	err = reqContext.ShouldBind(&logWorkInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to bind request"})
		reqContext.Error(err)
		return
	}

	workLog, err := logWork(logWorkInput, *user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to get work log"})
		reqContext.Error(err)
		return
	}

	err = coins.GiveUserCoins(*user, coins.CalculateCoinCountFromStudyMinutes(logWorkInput.Minutes))
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to give user coins"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"WorkLog": workLog})
}
