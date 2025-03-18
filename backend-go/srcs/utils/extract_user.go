package utils

import (
	"github.com/gin-gonic/gin"
	"srcs/models"
	"srcs/token"
)

func ExtractUserFromRequest(reqContext *gin.Context) (*models.TUser, error) {
	/*
		リクエストからユーザーを識別して返す関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		return nil, err
	}
	user := &models.TUser{}
	err = models.DB.First(user, userId).Error
	return user, err
}
