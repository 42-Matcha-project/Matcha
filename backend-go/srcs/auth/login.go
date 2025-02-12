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
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password" binding:"required"`
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := loginInput.validate(); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jwtToken, err := models.FetchUserAndGenerateJWTToken(loginInput.Username, loginInput.Email, loginInput.Password)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"token": jwtToken,
	})
}
