package password

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/models"
	"time"
)

func verifyOTP(resetPasswordInput ResetPasswordInput) (error, int) {
	/*
		OTPを認証する関数
		OTPが存在しない、一致しない、期限を超過している時にエラーを返す。
	*/
	ForgotEmailOTPPairsMutex.Lock()
	defer ForgotEmailOTPPairsMutex.Unlock()

	aOTPEntry, isExist := ForgotEmailOTPPairs[resetPasswordInput.Email]
	if !isExist {
		return errors.New(fmt.Sprintf("OTP %s does not exist", resetPasswordInput.Email)), applogs.ForgotEmailOTPPairsNotFound
	}

	if resetPasswordInput.OTP != aOTPEntry.OTP {
		return errors.New(fmt.Sprintf("OTP %s does not match", resetPasswordInput.OTP)), applogs.OTPNotMatch
	}

	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err, applogs.FailedToLoadTimeZone
	}
	elapsedTime := time.Now().In(location).Sub(aOTPEntry.CreatedAt)
	if elapsedTime > 5*time.Minute {
		delete(ForgotEmailOTPPairs, resetPasswordInput.Email)
		return errors.New(fmt.Sprintf("The OTP has already expired.")), applogs.OTPAlreadyExpired
	}

	delete(ForgotEmailOTPPairs, resetPasswordInput.Email)
	return nil, applogs.OTPVerifySuccess
}

func resetPassword(resetPasswordInput ResetPasswordInput) (error, int) {
	/*
		DBのパスワードを更新する関数。
	*/
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(resetPasswordInput.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err, applogs.FailedToGenerateRand
	}

	if err := models.DB.Model(&models.TUser{}).Where("email = ?", resetPasswordInput.Email).Update("password", string(hashedPassword)).Error; err != nil {
		return err, applogs.FailedToUpdateUser
	}

	return nil, applogs.ResetPasswordSuccess
}

type ResetPasswordInput struct {
	/*
		パスワードリセットリクエスト時に抽出するJSONデータの構造体
	*/
	Email       string `json:"Email" binding:"required"`
	OTP         string `json:"OTP" binding:"required"`
	NewPassword string `json:"NewPassword" binding:"required"`
}

func ResetPasswordHandler(reqContext *gin.Context) {
	/*
		パスワードリセットリクエストに対するハンドラー関数。
		ワンタイムパスワードと共に設定したいパスワードを受け取って、
		ユーザーのパスワードを更新する。
	*/
	var resetPasswordInput ResetPasswordInput
	if err := reqContext.ShouldBindJSON(&resetPasswordInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	if err, responseCode := verifyOTP(resetPasswordInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, responseCode, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		return
	}

	if err, responseCode := resetPassword(resetPasswordInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, responseCode, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.ResetPasswordSuccess, applogs.CreateJSONResponseByResponseCode(applogs.ResetPasswordSuccess, applogs.ResponseOptions{}))
}
