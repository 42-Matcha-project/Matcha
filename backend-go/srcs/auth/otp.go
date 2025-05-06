package auth

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/mail"
	"srcs/mail_contents"
	"srcs/utils"
	"strconv"
	"sync"
	"time"
)

type OTPEntry struct {
	OTP        string
	IsVerified bool
	CreatedAt  time.Time
}

var (
	EmailOTPPairsMutex sync.Mutex
	EmailOTPPairs      = make(map[string]*OTPEntry)
)

func saveOTP(Email string, OTP string) error {
	/*
		mapにOTPを保存する関数。
	*/
	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err
	}

	EmailOTPPairsMutex.Lock()
	defer EmailOTPPairsMutex.Unlock()
	EmailOTPPairs[Email] = &OTPEntry{
		OTP:        OTP,
		IsVerified: false,
		CreatedAt:  time.Now().In(location),
	}
	if os.Getenv("ENVIRONMENT") == "development" {
		fmt.Println("Saving OTP Pair: ", Email)
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

	EmailOTPPairsMutex.Lock()
	defer EmailOTPPairsMutex.Unlock()
	for email, aOTPEntry := range EmailOTPPairs {
		elapsedTime := time.Now().In(location).Sub(aOTPEntry.CreatedAt)
		if elapsedTime > 30*time.Minute {
			if os.Getenv("ENVIRONMENT") == "development" {
				fmt.Println("Deleting expired OTP:", email)
			}
			delete(EmailOTPPairs, email)
		}
	}

	return nil
}

type GenerateOTPInput struct {
	/*
		OTP生成時にリクエストから抽出するJSONデータの構造体
	*/
	Email string `json:"Email" binding:"required"`
}

func GenerateOTPHandler(reqContext *gin.Context) {
	/*
		OTP生成リクエストに対するハンドラー関数
		6桁のOTPを生成して、メールを送信する。
	*/
	var generateOTPInput GenerateOTPInput
	err := reqContext.ShouldBindJSON(&generateOTPInput)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	OTP, err := utils.GenerateRandomCode(6)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToGenerateRand, applogs.CreateJSONResponseByResponseCode(applogs.FailedToGenerateRand, applogs.ResponseOptions{}))
		return
	}

	err = mail.SendMail(generateOTPInput.Email, mail_contents.CreateOTPSubject(), mail_contents.CreateOTPMailText(OTP), mail_contents.CreateOTPMailHTML(OTP))
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToSendEmail, applogs.CreateJSONResponseByResponseCode(applogs.FailedToSendEmail, applogs.ResponseOptions{}))
		return
	}

	err = saveOTP(generateOTPInput.Email, OTP)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToSaveOTP, applogs.CreateJSONResponseByResponseCode(applogs.FailedToSaveOTP, applogs.ResponseOptions{}))
		return
	}

	err = cleanupExpiredOTPs()
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusInternalServerError, err, applogs.FailedToCleanUpExpiredOTPs, applogs.CreateJSONResponseByResponseCode(applogs.FailedToCleanUpExpiredOTPs, applogs.ResponseOptions{}))
		return
	}

	if os.Getenv("ENVIRONMENT") == "development" {
		applogs.RespondJSON(reqContext, http.StatusCreated, err, applogs.OTPGenerateSuccess, applogs.CreateJSONResponseByResponseCode(applogs.OTPGenerateSuccess, applogs.ResponseOptions{OTP: OTP}))
		return
	}
	applogs.RespondJSON(reqContext, http.StatusCreated, nil, applogs.OTPGenerateSuccess, applogs.CreateJSONResponseByResponseCode(applogs.OTPGenerateSuccess, applogs.ResponseOptions{}))
}

func verifyOTP(Email string, OTP string) (error, int) {
	/*
		OTPを認証する関数
	*/
	EmailOTPPairsMutex.Lock()
	defer EmailOTPPairsMutex.Unlock()

	aOTPEntry, isExist := EmailOTPPairs[Email]
	if !isExist {
		return errors.New(fmt.Sprintf("Email %s does not exist", Email)), applogs.EmailOTPPairsNotFound
	}

	if OTP != aOTPEntry.OTP {
		return errors.New(fmt.Sprintf("OTP %s does not match", OTP)), applogs.OTPNotMatch
	}

	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err, applogs.FailedToLoadTimeZone
	}
	elapsedTime := time.Now().In(location).Sub(aOTPEntry.CreatedAt) / time.Minute
	otp_deadline, err := strconv.ParseFloat(os.Getenv("OTP_DEADLINE"), 64)
	if err != nil {
		return errors.New(fmt.Sprintf("OTP_DEADLINE=%s can't convert to int", os.Getenv("OTP_DEADLINE"))), applogs.FailedToConvertType
	}
	if elapsedTime > time.Duration(otp_deadline)*time.Minute {
		delete(EmailOTPPairs, Email)
		return errors.New(fmt.Sprintf("The OTP has already expired.")), applogs.OTPAlreadyExpired
	}

	if aOTPEntry.IsVerified {
		return errors.New(fmt.Sprintf("OTP %s is already verified.", aOTPEntry.OTP)), applogs.EmailAlreadyVerified
	}
	aOTPEntry.IsVerified = true
	return nil, applogs.OTPVerifySuccess
}

type VerifyOTPInput struct {
	/*
		OTP認証時にリクエストから抽出するJSONデータの構造体
	*/
	Email string `json:"Email" binding:"required"`
	OTP   string `json:"OTP" binding:"required"`
}

func VerifyOTPHandler(reqContext *gin.Context) {
	/*
		OTPの認証リクエストに対するハンドラー関数。
	*/
	var verifyOTPInput VerifyOTPInput
	err := reqContext.ShouldBindJSON(&verifyOTPInput)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	err, responseCode := verifyOTP(verifyOTPInput.Email, verifyOTPInput.OTP)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, responseCode, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.OTPVerifySuccess, applogs.CreateJSONResponseByResponseCode(applogs.OTPVerifySuccess, applogs.ResponseOptions{}))
}

func IsEmailVerified(email string) (bool, error, int) {
	/*
		引数のemailがメール認証を完了しているかどうか
	*/
	if os.Getenv("ENVIRONMENT") == "development" {
		return true, nil, applogs.EmailAlreadyVerified
	}

	aOTPEntry, isExist := EmailOTPPairs[email]
	if !isExist {
		return false, errors.New(fmt.Sprintf("Email %s does not exist", email)), applogs.EmailNotFound
	}

	if !aOTPEntry.IsVerified {
		return false, errors.New(fmt.Sprintf("OTP %s is not verified", aOTPEntry.OTP)), applogs.EmailNotVerified
	}

	return true, nil, applogs.EmailAlreadyVerified
}
