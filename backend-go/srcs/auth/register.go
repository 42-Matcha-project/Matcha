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
	Username     string `json:"Username" binding:"required"`
	Email        string `json:"Email" binding:"required"`
	Password     string `json:"Password" binding:"required"`
	DisplayName  string `json:"DisplayName" binding:"required"`
	IconImageUrl string `json:"IconImageUrl"`
}

func registerUser(registerInput RegisterInput) (*models.TUser, error) {
	/*
		UserをDBに保存する関数。
	*/
	var err error

	registerUser := &models.TUser{
		Username:     registerInput.Username,
		Email:        registerInput.Email,
		Password:     registerInput.Password,
		DisplayName:  registerInput.DisplayName,
		IconImageURL: registerInput.IconImageUrl,
	}

	registerUser, err = registerUser.CreateUser()
	return registerUser, err
}

func Register(reqContext *gin.Context) {
	/*
		新規ユーザーを登録する関数。
		リクエストからJSONデータを抽出してDBに保存する。
		成功すればstatus200と登録したユーザーのデータを返す。
		失敗すればstatus400とエラー文を返す。
	*/
	var registerInput RegisterInput

	if err := reqContext.ShouldBindJSON(&registerInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	isVerified, err := IsEmailVerified(registerInput.Email)
	if !isVerified && err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Email is not verified"})
		reqContext.Error(err)
		return
	}

	user, err := registerUser(registerInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create user"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"user": user.PrepareOutput(),
	})
}
