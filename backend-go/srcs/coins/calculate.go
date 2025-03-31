package coins

import (
	"math"
	"os"
	"strconv"
)

func CalculateCoinCountFromStudyMinutes(minutes int64) int {
	/*
		勉強に応じたコイン枚数を計算する関数
	*/
	minutesPerInterval, _ := strconv.ParseFloat(os.Getenv("MINUTES_PER_INTERVAL"), 64)
	coinCountPerInterval, _ := strconv.ParseFloat(os.Getenv("COIN_COUNT_PER_INTERVAL"), 64)

	IntervalCount := math.Floor(float64(minutes) / minutesPerInterval)
	coinCount := IntervalCount * coinCountPerInterval
	return int(coinCount)
}
