package auth

import (
	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
	"net/http"
	"os"
	"srcs/mail_contents"
	"srcs/utils"
	"sync"
	"time"
)

type GenerateOTPInput struct {
	/*
		OTP生成時にリクエストから抽出するJSONデータの構造体
	*/
	Email string `json:"email" binding:"required"`
}

var (
	dialer     *gomail.Dialer
	dialerInit sync.Once
)

type OTPEntry struct {
	OTP       string
	CreatedAt time.Time
}

var (
	EmailOTPPairsMutex sync.Mutex
	EmailOTPPairs      = make(map[string]*OTPEntry)
)

func sendOTP(recipientEmail string, OTP string) error {
	/*
		OTP含んだメールをemailに送信する関数
	*/
	mailContent := gomail.NewMessage()

	mailContent.SetHeader("From", os.Getenv("ADMIN_EMAIL"))
	mailContent.SetHeader("To", recipientEmail)
	mailContent.SetHeader("Subject", "[Matcha]登録を完了させてください")
	mailContent.SetHeader("List-Unsubscribe", "mailto:"+os.Getenv("ADMIN_EMAIL"))
	mailContent.SetBody("text/plain", mail_contents.CreateOTPMailText(OTP))
	mailContent.AddAlternative("text/html", mail_contents.CreateOTPMailHTML(OTP))

	dialerInit.Do(func() {
		dialer = gomail.NewDialer("smtp.gmail.com", 587, os.Getenv("ADMIN_EMAIL"), os.Getenv("ADMIN_EMAIL_PASSWORD"))
	})

	err := dialer.DialAndSend(mailContent)
	return err
}

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
		OTP:       OTP,
		CreatedAt: time.Now().In(location),
	}
	return nil
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

	err = sendOTP(generateOTPInput.Email, OTP)
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

	reqContext.Status(http.StatusOK)
}
