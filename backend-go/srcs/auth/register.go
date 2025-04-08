package auth

import (
	"net/http"
	"srcs/applogs"
	"srcs/buildings"
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

func registerUser(registerInput RegisterInput) (*models.TUser, error, int) {
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

	registerUser, err, responseCode := registerUser.CreateUser()
	return registerUser, err, responseCode
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
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	isVerified, err, responseCode := IsEmailVerified(registerInput.Email)
	if !isVerified && err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	user, err, responseCode := registerUser(registerInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(responseCode, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	err = buildings.BuildDefaultBuilding(*user)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, applogs.CreateJSONResponseByResponseCode(applogs.FailedToBuildDefaultBuilding, applogs.ResponseOptions{}))
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, applogs.CreateJSONResponseByResponseCode(applogs.RegisterSuccess, applogs.ResponseOptions{}))
}
