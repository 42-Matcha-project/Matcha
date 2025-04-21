package reports

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/mail"
	"srcs/mail_contents"
	"srcs/models"
	"srcs/utils"
)

func sendReportEmailToAdmin(user models.TUser, submitReportInput SubmitReportInput) (error, int) {
	/*
		報告をタイプごとに振り分けて対応するメールを管理者に送信する関数
	*/
	var (
		subject   string
		textPlain string
		textHTML  string
	)

	if submitReportInput.Type == "FeatureRequest" {
		subject = mail_contents.CreateFeatureRequestSubject(true)
		textPlain = mail_contents.CreateFeatureRequestText(true, user, submitReportInput.Text)
		textHTML = mail_contents.CreateFeatureRequestHTML(true, user, submitReportInput.Text)
	} else if submitReportInput.Type == "BugReport" {
		subject = mail_contents.CreateBugReportSubject(true)
		textPlain = mail_contents.CreateBugReportText(true, user, submitReportInput.Text)
		textHTML = mail_contents.CreateBugReportHTML(true, user, submitReportInput.Text)
	} else if submitReportInput.Type == "AppFeedback" {
		subject = mail_contents.CreateAppFeedbackSubject(true)
		textPlain = mail_contents.CreateAppFeedbackText(true, user, submitReportInput.Text)
		textHTML = mail_contents.CreateAppFeedbackHTML(true, user, submitReportInput.Text)
	} else if submitReportInput.Type == "UserReport" {
		subject = mail_contents.CreateUserReportSubject(true)
		textPlain = mail_contents.CreateUserReportText(true, user, submitReportInput.Text)
		textHTML = mail_contents.CreateUserReportHTML(true, user, submitReportInput.Text)
	} else {
		return errors.New("Unknown report type"), applogs.UnknownReportType
	}

	err := mail.SendMail(os.Getenv("ADMIN_EMAIL"), subject, textPlain, textHTML)
	return err, applogs.FailedToSendEmail
}

func sendReportEmailToUser(user models.TUser, submitReportInput SubmitReportInput) (error, int) {
	/*
		報告をタイプごとに振り分けて対応するメールをユーザーに送信する関数
	*/
	var (
		subject   string
		textPlain string
		textHTML  string
	)

	if submitReportInput.Type == "FeatureRequest" {
		subject = mail_contents.CreateFeatureRequestSubject(false)
		textPlain = mail_contents.CreateFeatureRequestText(false, user, submitReportInput.Text)
		textHTML = mail_contents.CreateFeatureRequestHTML(false, user, submitReportInput.Text)
	} else if submitReportInput.Type == "BugReport" {
		subject = mail_contents.CreateBugReportSubject(false)
		textPlain = mail_contents.CreateBugReportText(false, user, submitReportInput.Text)
		textHTML = mail_contents.CreateBugReportHTML(false, user, submitReportInput.Text)
	} else if submitReportInput.Type == "AppFeedback" {
		subject = mail_contents.CreateAppFeedbackSubject(false)
		textPlain = mail_contents.CreateAppFeedbackText(false, user, submitReportInput.Text)
		textHTML = mail_contents.CreateAppFeedbackHTML(false, user, submitReportInput.Text)
	} else if submitReportInput.Type == "UserReport" {
		subject = mail_contents.CreateUserReportSubject(false)
		textPlain = mail_contents.CreateUserReportText(false, user, submitReportInput.Text)
		textHTML = mail_contents.CreateUserReportHTML(false, user, submitReportInput.Text)
	} else {
		return errors.New("Unknown report type"), applogs.UnknownReportType
	}

	err := mail.SendMail(user.Email, subject, textPlain, textHTML)
	return err, applogs.FailedToSendEmail
}

type SubmitReportInput struct {
	/*
		運営への報告リクエスト時に抽出するJSONデータの構造体
	*/
	Type string `json:"Type" binding:"required"`
	Text string `json:"Text" binding:"required"`
}

func SubmitReportsHandler(reqContext *gin.Context) {
	/*
		運営への報告リクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	var submitReportInput SubmitReportInput
	if err := reqContext.ShouldBindJSON(&submitReportInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err, responseCode := sendReportEmailToAdmin(*user, submitReportInput)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err, responseCode = sendReportEmailToUser(*user, submitReportInput)
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.SubmitReportSuccess, applogs.ResponseOptions{}))
}
