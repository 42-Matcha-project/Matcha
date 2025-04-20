package utils

import (
	"database/sql"
	"os"
	"time"
)

func AdjustDateToFourAM(date time.Time) time.Time {
	adjustedDateBase := time.Date(date.Year(), date.Month(), date.Day(), 4, 0, 0, 0, time.Now().Location())
	var adjustedDate time.Time
	if date.Before(adjustedDateBase) {
		adjustedDate = adjustedDateBase.Add(-24 * time.Hour)
	} else {
		adjustedDate = adjustedDateBase
	}

	return adjustedDate
}

func ConvertToMyTimeZone(inputTime time.Time) (time.Time, error) {
	/*
		アプリのタイムゾーンに合わせた時間に変換する関数
	*/
	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return inputTime, err
	}

	return inputTime.In(location), err
}

func ConvertToNullTime(time time.Time) sql.NullTime {
	if time.IsZero() {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{Valid: true, Time: time}
}
