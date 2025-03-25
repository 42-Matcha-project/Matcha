package profile

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/utils"
)

func GetProfileHandler(reqContext *gin.Context) {
	/*
		ユーザーのプロフィールを取得するリクエストに対するハンドラー関数
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{"User": user.PrepareOutput()})
}
