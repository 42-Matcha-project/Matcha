package profile

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/applogs"
	"srcs/utils"
)

func GetProfileHandler(reqContext *gin.Context) {
	/*
		ユーザーのプロフィールを取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		applogs.RespondJSON(reqContext, http.StatusNotFound, err, applogs.UserNotFound, applogs.CreateJSONResponseByResponseCode(applogs.UserNameForUserAlreadyExists, applogs.ResponseOptions{}))
		return
	}

	applogs.RespondJSON(reqContext, http.StatusOK, nil, applogs.GetProfileSuccess, applogs.CreateJSONResponseByResponseCode(applogs.GetProfileSuccess, applogs.ResponseOptions{Me: user}))
}
