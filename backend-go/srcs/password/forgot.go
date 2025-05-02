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
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToGenerateRand, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGenerateRand, applogs.ResponseOptions{}))
		return
	}

	var forgotPasswordInput ForgotPasswordInput
	if err = reqContext.ShouldBindJSON(&forgotPasswordInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	if err = mail.SendMail(forgotPasswordInput.Email, mail_contents.CreatePasswordForgotSubject(), mail_contents.CreatePasswordForgotMailText(OTP), mail_contents.CreatePasswordForgotMailHTML(OTP)); err != nil {
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToSendEmail, applogs.CreateJSONResponseByResponseCode(applogs.FailedToSendEmail, applogs.ResponseOptions{}))
		return
	}

	if err = saveOTP(OTP, forgotPasswordInput.Email); err != nil {
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToSaveOTP, applogs.CreateJSONResponseByResponseCode(applogs.FailedToSaveOTP, applogs.ResponseOptions{}))
		return
	}

	if err = cleanupExpiredOTPs(); err != nil {
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToCleanUpExpiredOTPs, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCleanUpExpiredOTPs, applogs.ResponseOptions{}))
		return
	}

	if os.Getenv("ENVIRONMENT") == "development" {
		applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.HandleForgotPassword, applogs.CreateJSONResponseByResponseCode(applogs.HandleForgotPassword, applogs.ResponseOptions{OTP: OTP}))
		return
	}
	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.HandleForgotPassword, applogs.CreateJSONResponseByResponseCode(applogs.HandleForgotPassword, applogs.ResponseOptions{}))
}
