package auth

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/models"
)

type LoginInput struct {
	/*
		ログイン時にリクエストからJSONデータを抽出するための構造体。
	*/
	Username string `json:"Username"`
	Email    string `json:"Email"`
	Password string `json:"Password" binding:"required"`
}

func (loginInput *LoginInput) validate() error {
	/*
		ログイン時に必要なJSONデータが正しいかを検証をする関数。
		usernameかemailのどちらかが必須。
	*/
	if loginInput.Username == "" && loginInput.Email == "" {
		return errors.New("username or email is required")
	}
	return nil
}

func Login(reqContext *gin.Context) {
	/*
		ログイン処理をする関数。
		JSONデータはpasswordが必須で、usernameかemailのどちらかも必須。
		対応するuserのIDからJWTトークンを生成し返す。
	*/
	var loginInput LoginInput

	if err := reqContext.ShouldBindJSON(&loginInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}
	if err := loginInput.validate(); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.LackOfLoginData, applogs.CreateJSONResponseByResponseCode(applogs.LackOfLoginData, applogs.ResponseOptions{}))
		return
	}

	jwtTokenString, err, responseCode := models.FetchUserAndGenerateJWTTokenString(loginInput.Username, loginInput.Email, loginInput.Password)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, responseCode, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.LoginSuccess, applogs.CreateJSONResponseByResponseCode(applogs.LoginSuccess, applogs.ResponseOptions{Token: jwtTokenString}))
}
