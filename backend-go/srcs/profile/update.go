package profile

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
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
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNotFound, applogs.ResponseOptions{}))
		return
	}

	var updateProfileInput UpdateProfileInput
	if err := reqContext.ShouldBindJSON(&updateProfileInput); err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
		return
	}

	err = UpdateProfile(user, updateProfileInput)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusBadRequest, err, applogs.FailedToUpdateProfile, applogs.CreateJSONResponseByResponseCode(applogs.FailedToUpdateUser, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.UpdateProfileSuccess, applogs.CreateJSONResponseByResponseCode(applogs.UpdateProfileSuccess, applogs.ResponseOptions{Me: user}))
}
