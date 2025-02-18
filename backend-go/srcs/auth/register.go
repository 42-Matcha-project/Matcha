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
	Username         string   `json:"Username" binding:"required"`
	Email            string   `json:"Email" binding:"required"`
	Password         string   `json:"Password" binding:"required"`
	DisplayName      string   `json:"DisplayName" binding:"required"`
	Gender           string   `json:"Gender" binding:"required"`
	Introduction     string   `json:"Introduction"`
	IconImageUrl     string   `json:"IconImageUrl"`
	Affiliations     []string `json:"Affiliations"`
	PictureUrls      []string `json:"PictureUrls"`
	InterestTags     []string `json:"InterestTags"`
	SexualPreference string   `json:"SexualPreference"`
}

func registerUser(registerInput RegisterInput) (*models.TUser, error) {
	/*
		UserをDBに保存する関数。
	*/
	registerUser := &models.TUser{
		Username:         registerInput.Username,
		Email:            registerInput.Email,
		Password:         registerInput.Password,
		DisplayName:      registerInput.DisplayName,
		Gender:           registerInput.Gender,
		Introduction:     registerInput.Introduction,
		IconImageURL:     registerInput.IconImageUrl,
		SexualPreference: registerInput.SexualPreference,
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

			userAffiliation := &models.TUserAffiliation{
				UserID:        registerUserID,
				AffiliationID: affiliation.ID,
			}
			userAffiliation, err = userAffiliation.CreateUserAffiliation()
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func registerPictures(registerInput RegisterInput, registerUserID int) error {
	/*
		Picturesを登録する関数。
	*/
	var err error
	if registerInput.PictureUrls != nil && len(registerInput.PictureUrls) != 0 {
		for i := 0; i < len(registerInput.PictureUrls); i++ {
			picture := &models.TPicture{
				UserID:     registerUserID,
				PictureURL: registerInput.PictureUrls[i],
			}
			picture, err = picture.CreatePicture()
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func registerInterestTags(registerInput RegisterInput, registerUserID int) error {
	/*
		InterestTagsを登録する関数。
	*/
	var err error
	if registerInput.InterestTags != nil && len(registerInput.InterestTags) != 0 {
		for i := 0; i < len(registerInput.InterestTags); i++ {
			interestTag := &models.TInterestTag{
				Name: registerInput.InterestTags[i],
			}
			interestTag, err = interestTag.CreateInterestTag()
			if err != nil {
				return err
			}

			userInterestTag := &models.TUserInterestTag{
				UserID:        registerUserID,
				InterestTagID: interestTag.ID,
			}
			userInterestTag, err = userInterestTag.CreateUserInterestTag()
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

	if err = registerPictures(registerInput, user.ID); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create pictures"})
		reqContext.Error(err)
		return
	}

	if err = registerInterestTags(registerInput, user.ID); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create interest tags"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"user": user.PrepareOutput(),
	})
}
