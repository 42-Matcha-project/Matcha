package utils

import "time"

func IsOnSale(saleStartTime time.Time, saleEndTime time.Time) bool {
	/*
		現在が販売時間かどうかを判定する関数
	*/
	currentTime, _ := ConvertToMyTimeZone(time.Now())

	return currentTime.After(saleStartTime) && currentTime.Before(saleEndTime)
}
