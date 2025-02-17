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

func registerUser(registerInput RegisterInput) (*models.TUser, error) {
	/*
		UserをDBに保存する関数。
	*/
	registerUser := &models.TUser{
		Username:     registerInput.Username,
		Email:        registerInput.Email,
		Password:     registerInput.Password,
		DisplayName:  registerInput.DisplayName,
		Gender:       registerInput.Gender,
		Introduction: registerInput.Introduction,
		IconImageURL: registerInput.IconImageUrl,
	}

	var err error
	registerUser, err = registerUser.CreateUser()
	return registerUser, err
}

func registerAffiliations(registerInput RegisterInput, registerUserID int) error {
	/*
		AffiliationをDBに保存する関数。
		Affiliationの配列を受け取りそれらを各要素ごとにDBに保存する。
	*/
	var err error
	if registerInput.Affiliations != nil && len(registerInput.Affiliations) != 0 {
		for i := 0; i < len(registerInput.Affiliations); i++ {
			affiliation := &models.TAffiliation{
				Affiliation: registerInput.Affiliations[i],
			}
			affiliation, err = affiliation.CreateAffiliation()
			if err != nil {
				return err
			}

			user_affliation := &models.TUserAffiliation{
				UserID:        registerUserID,
				AffiliationID: affiliation.ID,
			}
			user_affliation, err = user_affliation.CreateUserAffiliation()
			if err != nil {
				return err
			}
		}
	}
	return nil
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

	user, err := registerUser(registerInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create user"})
		reqContext.Error(err)
		return
	}

	if err = registerAffiliations(registerInput, user.ID); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create affiliation"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"user": user.PrepareOutput(),
	})
}
