package works

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/models"
	"srcs/utils"
	"time"
)

func GetWorkLogByDate(date time.Time, user models.TUser) (*models.TWorkLog, error) {
	var workLog *models.TWorkLog
	err := models.DB.Where("date = ?", date).First(workLog).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return workLog, err
}

type WorkLogResponse struct {
	WorkID   int       `json:"WorkID"`
	WorkName string    `json:"WorkName"`
	Date     time.Time `json:"StartAt"`
	Minutes  int64     `json:"Minutes"`
}

func (w WorkLogResponse) GetWorkID() int      { return w.WorkID }
func (w WorkLogResponse) GetWorkName() string { return w.WorkName }
func (w WorkLogResponse) GetDate() time.Time  { return w.Date }
func (w WorkLogResponse) GetMinutes() int64   { return w.Minutes }
func ConvertToWorkLogInfos(workLogResponses []WorkLogResponse) []applogs.WorkLogInfo {
	workLogInfos := make([]applogs.WorkLogInfo, len(workLogResponses))
	for i, workLogResponse := range workLogResponses {
		workLogInfos[i] = workLogResponse
	}
	return workLogInfos
}

func getWorkLogs(user models.TUser) ([]WorkLogResponse, error) {
	/*
		リクエストを送っているユーザーの作業ログ一覧をDBから取得する関数
		StartAtが新しい順に10件まで取得する。
	*/
	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return nil, err
	}
	today := time.Now().In(location)
	sevenDaysAgo := today.AddDate(0, 0, -7)

	var workLogs []models.TWorkLog
	err = models.DB.
		Preload("Work").
		Where("user_id = ?", user.ID).
		Where("date >= ? AND date <= ?", sevenDaysAgo, today.Add(-7*24*time.Hour)).
		Find(&workLogs).Error
	if err != nil {
		return nil, err
	}

	var workLogsResponse []WorkLogResponse
	for _, workLog := range workLogs {
		workLogsResponse = append(workLogsResponse, WorkLogResponse{
			WorkID:   workLog.WorkID,
			WorkName: workLog.Work.WorkName,
			Date:     workLog.Date,
			Minutes:  workLog.Minutes,
		})
	}
	return workLogsResponse, err
}

func GetWorkLogsHandler(reqContext *gin.Context) {
	/*
		作業ログを取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	workLogsResponse, err := getWorkLogs(*user)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGetWorkLog, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.GetWorkLogsSuccess, applogs.ResponseOptions{WorkLogs: ConvertToWorkLogInfos(workLogsResponse)}))
}
