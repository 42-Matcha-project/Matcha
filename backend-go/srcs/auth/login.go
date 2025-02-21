package auth

import (
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}
	if err := loginInput.validate(); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		reqContext.Error(err)
		return
	}

	jwtTokenString, err := models.FetchUserAndGenerateJWTTokenString(loginInput.Username, loginInput.Email, loginInput.Password)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to generate JWT"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"token": jwtTokenString,
	})
}
