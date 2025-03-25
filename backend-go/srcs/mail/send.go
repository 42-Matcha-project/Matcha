package mail

import (
	"gopkg.in/gomail.v2"
	"os"
	"sync"
)

var (
	dialer     *gomail.Dialer
	dialerInit sync.Once
)

func SendMail(recipientEmail string, subject string, textPlain string, textHTML string) error {
	/*
		メールを送信する関数
	*/
	mailContent := gomail.NewMessage()

	mailContent.SetHeader("From", os.Getenv("ADMIN_EMAIL"))
	mailContent.SetHeader("To", recipientEmail)
	mailContent.SetHeader("Subject", subject)
	mailContent.SetHeader("List-Unsubscribe", "mailto:"+os.Getenv("ADMIN_EMAIL"))
	mailContent.SetBody("text/plain", textPlain)
	mailContent.AddAlternative("text/html", textHTML)

	dialerInit.Do(func() {
		dialer = gomail.NewDialer("smtp.gmail.com", 587, os.Getenv("ADMIN_EMAIL"), os.Getenv("ADMIN_EMAIL_PASSWORD"))
	})

	err := dialer.DialAndSend(mailContent)
	return err
}
