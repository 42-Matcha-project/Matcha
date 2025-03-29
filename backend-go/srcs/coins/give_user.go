package coins

import (
	"errors"
	"math"
	"srcs/models"
)

func GiveUserCoins(user models.TUser, coinCountToGive int) error {
	/*
		ユーザーにコインを与える関数
	*/
	if user.CoinCount >= math.MaxInt-coinCountToGive {
		return errors.New("coinCountToGive exceeded")
	}

	user.CoinCount += coinCountToGive
	err := models.DB.Save(&user).Error
	return err
}
