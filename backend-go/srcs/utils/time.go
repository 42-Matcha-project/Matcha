package utils

import (
	"database/sql"
	"os"
	"time"
)

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
