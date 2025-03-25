package profile

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/utils"
)

func UpdateProfile(user *models.TUser, updateProfileInput UpdateProfileInput) error {
	/*
		DBのユーザーの情報を更新をする関数
	*/
	updates := map[string]interface{}{}

	if updateProfileInput.DisplayName != "" {
		updates["display_name"] = updateProfileInput.DisplayName
	}
	if updateProfileInput.IconImageURL != "" {
		updates["icon_image_url"] = updateProfileInput.IconImageURL
	}
	if updateProfileInput.Introduction != nil {
		updates["introduction"] = *updateProfileInput.Introduction
	}
	if updateProfileInput.TownName != "" {
		updates["town_name"] = updateProfileInput.TownName
	}

	if len(updates) > 0 {
		if err := models.DB.Model(user).Updates(updates).Error; err != nil {
			return err
		}
	}

	return nil
}

type UpdateProfileInput struct {
	/*
		ユーザーのプロフィールを更新するリクエスト時に抽出するJSONデータの構造体
	*/
	DisplayName  string  `json:"DisplayName"`
	IconImageURL string  `json:"IconImageUrl"`
	Introduction *string `json:"Introduction"`
	TownName     string  `json:"TownName"`
}

func UpdateProfileHandler(reqContext *gin.Context) {
	/*
		ユーザーのプロフィールを更新するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not authenticated"})
		reqContext.Error(err)
		return
	}

	var updateProfileInput UpdateProfileInput
	if err := reqContext.BindJSON(&updateProfileInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	err = UpdateProfile(user, updateProfileInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to update profile"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"User": user.PrepareOutput()})
}
