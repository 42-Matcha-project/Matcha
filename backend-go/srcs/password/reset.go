package password

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"os"
	"srcs/models"
	"time"
)

func verifyOTP(resetPasswordInput ResetPasswordInput) error {
	/*
		OTPを認証する関数
		OTPが存在しない、一致しない、期限を超過している時にエラーを返す。
	*/
	ForgotEmailOTPPairsMutex.Lock()
	defer ForgotEmailOTPPairsMutex.Unlock()

	aOTPEntry, isExist := ForgotEmailOTPPairs[resetPasswordInput.Email]
	if !isExist {
		return errors.New(fmt.Sprintf("OTP %s does not exist", resetPasswordInput.Email))
	}

	if resetPasswordInput.OTP != aOTPEntry.OTP {
		return errors.New(fmt.Sprintf("OTP %s does not match", resetPasswordInput.OTP))
	}

	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err
	}
	elapsedTime := time.Now().In(location).Sub(aOTPEntry.CreatedAt)
	if elapsedTime > 5*time.Minute {
		delete(ForgotEmailOTPPairs, resetPasswordInput.Email)
		return errors.New(fmt.Sprintf("The OTP has already expired."))
	}

	delete(ForgotEmailOTPPairs, resetPasswordInput.Email)
	return nil
}

func resetPassword(resetPasswordInput ResetPasswordInput) error {
	/*
		DBのパスワードを更新する関数。
	*/
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(resetPasswordInput.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	if err := models.DB.Model(&models.TUser{}).Where("email = ?", resetPasswordInput.Email).Update("password", string(hashedPassword)).Error; err != nil {
		return err
	}

	return nil
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
	if err := reqContext.ShouldBind(&resetPasswordInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	if err := verifyOTP(resetPasswordInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "OTP does not match"})
		reqContext.Error(err)
		return
	}

	if err := resetPassword(resetPasswordInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to reset password."})
		reqContext.Error(err)
		return
	}

	reqContext.Status(http.StatusOK)
}
