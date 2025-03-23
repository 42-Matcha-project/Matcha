package auth

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/mail"
	"srcs/mail_contents"
	"srcs/utils"
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
	Email string `json:"email" binding:"required"`
}

func GenerateOTPHandler(reqContext *gin.Context) {
	/*
		OTP生成リクエストに対するハンドラー関数
		6桁のOTPを生成して、メールを送信する。
	*/
	var generateOTPInput GenerateOTPInput
	err := reqContext.ShouldBindJSON(&generateOTPInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	OTP, err := utils.GenerateRandomCode(6)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		reqContext.Error(err)
		return
	}

	err = mail.SendMail(generateOTPInput.Email, mail_contents.CreateOTPSubject(), mail_contents.CreateOTPMailText(OTP), mail_contents.CreateOTPMailHTML(OTP))
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		reqContext.Error(err)
		return
	}

	err = saveOTP(generateOTPInput.Email, OTP)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save OTP"})
		reqContext.Error(err)
		return
	}

	err = cleanupExpiredOTPs()
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cleanup expired OTPs"})
		reqContext.Error(err)
		return
	}

	if os.Getenv("ENVIRONMENT") == "development" {
		reqContext.JSON(http.StatusCreated, gin.H{"OTP": OTP})
	}
	reqContext.Status(http.StatusCreated)
}

func verifyOTP(Email string, OTP string) error {
	/*
		OTPを認証する関数
	*/
	EmailOTPPairsMutex.Lock()
	defer EmailOTPPairsMutex.Unlock()

	aOTPEntry, isExist := EmailOTPPairs[Email]
	if !isExist {
		return errors.New(fmt.Sprintf("Email %s does not exist", Email))
	}

	if OTP != aOTPEntry.OTP {
		return errors.New(fmt.Sprintf("OTP %s does not match", OTP))
	}

	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return err
	}
	elapsedTime := time.Now().In(location).Sub(aOTPEntry.CreatedAt)
	if elapsedTime > 5*time.Minute {
		delete(EmailOTPPairs, Email)
		return errors.New(fmt.Sprintf("The OTP has already expired."))
	}

	if aOTPEntry.IsVerified {
		return errors.New(fmt.Sprintf("OTP %s is already verified.", aOTPEntry.OTP))
	}
	aOTPEntry.IsVerified = true
	return nil
}

type VerifyOTPInput struct {
	/*
		OTP認証時にリクエストから抽出するJSONデータの構造体
	*/
	Email string `json:"email" binding:"required"`
	OTP   string `json:"otp" binding:"required"`
}

func VerifyOTPHandler(reqContext *gin.Context) {
	/*
		OTPの認証リクエストに対するハンドラー関数。
	*/
	var verifyOTPInput VerifyOTPInput
	err := reqContext.ShouldBindJSON(&verifyOTPInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	err = verifyOTP(verifyOTPInput.Email, verifyOTPInput.OTP)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify OTP"})
		reqContext.Error(err)
		return
	}

	reqContext.Status(http.StatusOK)
}

func IsEmailVerified(email string) (bool, error) {
	/*
		引数のemailがメール認証を完了しているかどうか
	*/
	aOTPEntry, isExist := EmailOTPPairs[email]
	if !isExist {
		return false, errors.New(fmt.Sprintf("Email %s does not exist", email))
	}

	if !aOTPEntry.IsVerified {
		return false, errors.New(fmt.Sprintf("OTP %s is not verified", aOTPEntry.OTP))
	}

	return true, nil
}
