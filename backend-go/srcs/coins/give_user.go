package coins

import (
	"errors"
	"math"
	"srcs/applogs"
	"srcs/models"
)

func GiveUserCoins(user models.TUser, coinCountToGive int) (error, int) {
	/*
		ユーザーにコインを与える関数
	*/
	if user.CoinCount >= math.MaxInt-coinCountToGive {
		return errors.New("coinCountToGive exceeded"), applogs.CoinCountToGiveExceeded
	}

	user.CoinCount += coinCountToGive
	err := models.DB.Save(&user).Error
	return err, applogs.FailedToSaveUser
}
