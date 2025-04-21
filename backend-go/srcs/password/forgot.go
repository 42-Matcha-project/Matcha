package password

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/auth"
	"srcs/mail"
	"srcs/mail_contents"
	"srcs/utils"
	"sync"
	"time"
)

type ForgotPasswordInput struct {
	/*
	 パスワードを忘れた際に送るリクエストに対するハンドラー関数
	*/
	Email string `json:"Email" binding:"required"`
}

var (
	ForgotEmailOTPPairsMutex sync.Mutex
	ForgotEmailOTPPairs      = make(map[string]auth.OTPEntry)
)

func saveOTP(OTP string, email string) error {
	/*
		OTPを保存する関数
	*/
	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err
	}

	ForgotEmailOTPPairsMutex.Lock()
	defer ForgotEmailOTPPairsMutex.Unlock()
	ForgotEmailOTPPairs[email] = auth.OTPEntry{
		OTP:        OTP,
		IsVerified: false,
		CreatedAt:  time.Now().In(location),
	}

	return nil
}

func cleanupExpiredOTPs() error {
	/*
		期限切れのOTPを削除する関数
	*/
	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err
	}

	ForgotEmailOTPPairsMutex.Lock()
	defer ForgotEmailOTPPairsMutex.Unlock()
	for email, aOTPEntry := range ForgotEmailOTPPairs {
		elapsedTime := time.Now().In(location).Sub(aOTPEntry.CreatedAt)
		if elapsedTime > 30*time.Minute {
			if os.Getenv("ENVIRONMENT") == "development" {
				fmt.Println("Deleting expired OTP:", email)
			}
			delete(ForgotEmailOTPPairs, email)
		}
	}

	return nil
}

func ForgotPasswordHandler(reqContext *gin.Context) {
	/*
		パスワードを忘れた際に送るリクエストに対するハンドラー関数。
		ワンタイムパスワードを生成してそのメールアドレスに送信する。
	*/
	OTP, err := utils.GenerateRandomCode(6)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGenerateRand, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var forgotPasswordInput ForgotPasswordInput
	if err = reqContext.ShouldBindJSON(&forgotPasswordInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if err = mail.SendMail(forgotPasswordInput.Email, mail_contents.CreatePasswordForgotSubject(), mail_contents.CreatePasswordForgotMailText(OTP), mail_contents.CreatePasswordForgotMailHTML(OTP)); err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(applogs.FailedToSendEmail, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if err = saveOTP(OTP, forgotPasswordInput.Email); err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(applogs.FailedToSaveOTP, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if err = cleanupExpiredOTPs(); err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCleanUpExpiredOTPs, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	if os.Getenv("ENVIRONMENT") == "development" {
		reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.HandleForgotPassword, applogs.ResponseOptions{OTP: OTP}))
		return
	}
	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.HandleForgotPassword, applogs.ResponseOptions{}))
}
