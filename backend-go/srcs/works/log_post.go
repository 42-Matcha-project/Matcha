package works

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/coins"
	"srcs/models"
	"srcs/utils"
	"time"
)

type LogWorkInput struct {
	WorkID  int       `json:"WorkID" binding:"required"`
	Date    time.Time `json:"StartAt"`
	Minutes int64     `json:"Minutes" binding:"required"`
}

func logWork(logWorkInput LogWorkInput, user models.TUser) (*models.TWorkLog, error) {
	/*
		作業ログをDBに保存する関数。
		StartAtが無ければMinutesから時刻を計算する
	*/
	if logWorkInput.Date.IsZero() {
		timeZone := os.Getenv("TIME_ZONE")
		location, err := time.LoadLocation(timeZone)
		if err != nil {
			return nil, err
		}
		logWorkInput.Date = time.Now().In(location).Add(-time.Duration(logWorkInput.Minutes) * time.Minute)
	}

	adjustedDate := utils.AdjustDateToFourAM(logWorkInput.Date)

	workLog, err := GetWorkLogByDate(adjustedDate, user)
	if err != nil {
		return nil, err
	}

	if workLog == nil {
		workLog = &models.TWorkLog{
			WorkID:  logWorkInput.WorkID,
			Date:    logWorkInput.Date,
			Minutes: logWorkInput.Minutes,
		}
		err = models.DB.Create(&workLog).Error
	} else {
		workLog.Minutes += logWorkInput.Minutes
		err = models.DB.Model(workLog).Updates(workLog).Error
	}
	return workLog, err
}

func LogWorkHandler(reqContext *gin.Context) {
	/*
		作業ログを記録するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var logWorkInput LogWorkInput
	err = reqContext.ShouldBindJSON(&logWorkInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	_, err = logWork(logWorkInput, *user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCreateWorkLog, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err, responseCode := coins.GiveUserCoins(*user, coins.CalculateCoinCountFromStudyMinutes(logWorkInput.Minutes))
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.LogWorkSuccess, applogs.ResponseOptions{}))
}
