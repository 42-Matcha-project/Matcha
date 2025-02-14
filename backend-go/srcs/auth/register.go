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
	Username          string   `json:"Username" binding:"required"`
	Email             string   `json:"Email" binding:"required"`
	Password          string   `json:"Password" binding:"required"`
	DisplayName       string   `json:"DisplayName" binding:"required"`
	Gender            string   `json:"Gender" binding:"required"`
	Introduction      string   `json:"Introduction"`
	IconImageUrl      string   `json:"IconImageUrl"`
	Affiliations      []string `json:"Affiliations"`
	PictureUrls       []string `json:"PictureUrls"`
	InterestTags      []string `json:"InterestTags"`
	SexualPreferences []string `json:"SexualPreferences"`
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
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	registerUser := &models.TUser{
		Username:     registerInput.Username,
		Email:        registerInput.Email,
		Password:     registerInput.Password,
		DisplayName:  registerInput.DisplayName,
		Gender:       registerInput.Gender,
		Introduction: registerInput.Introduction,
		IconImageURL: registerInput.IconImageUrl,
	}

	registerUser, err := registerUser.CreateUser()
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create user"})
		reqContext.Error(err)
		return
	}

	if registerInput.Affiliations != nil && len(registerInput.Affiliations) != 0 {
		for i := 0; i < len(registerInput.Affiliations); i++ {
			affiliation := &models.TAffiliation{
				Affiliation: registerInput.Affiliations[i],
			}
			affiliation, err = affiliation.CreateAffiliation()
			if err != nil {

			}
		}
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"user_data": registerUser.PrepareOutput(),
	})
}
