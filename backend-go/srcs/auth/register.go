package auth

import (
	"net/http"
	"srcs/models"

	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	/*
		登録時にリクエストからJSONデータを抽出するための構造体。
	*/
	Username     string `json:"username" binding:"required"`
	Email        string `json:"email" binding:"required"`
	Password     string `json:"password" binding:"required"`
	DisplayName  string `json:"display_name" binding:"required"`
	Gender       string `json:"gender" binding:"required"`
	Introduction string `json:"introduction"`
	IconImageUrl string `json:"icon_image_url"`
}

func RegisterUser(reqContext *gin.Context) {
	/*
		新規ユーザーを登録する関数。
		リクエストからJSONデータを抽出してDBに保存する。
		成功すればstatus200と登録したユーザーのデータを返す。
		失敗すればstatus400とエラー文を返す。
	*/
	var registerInput RegisterInput

	if err := reqContext.ShouldBindJSON(&registerInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	registerUser := &models.User{
		Username:     registerInput.Username,
		Email:        registerInput.Email,
		Password:     registerInput.Password,
		DisplayName:  registerInput.DisplayName,
		Gender:       registerInput.Gender,
		Introduction: registerInput.Introduction,
		IconImageURL: registerInput.IconImageUrl,
	}

	registerUser, err := registerUser.Save()
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"user_data": registerUser.PrepareOutput(),
	})
}
