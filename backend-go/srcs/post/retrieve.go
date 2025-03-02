package post

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/token"
)

func Retrieve(reqContext *gin.Context) {
	/*
		タイムラインの投稿一覧を取得する関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to extract userId"})
		reqContext.Error(err)
		return
	}
	var interestTagIDs []int
	err = models.DB.Model(&models.TUser{}).
		Joins("JOIN t_user_interest_tags ON t_user_interest_tags.t_user_id = t_users.id").
		Joins("JOIN t_interest_tags ON t_user_interest_tags.t_interest_tag_id =  t_interest_tags.id").
		Where("t_users.id = ?", userId).
		Pluck("t_interest_tags.id", &interestTagIDs).Error
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve interest tags"})
		reqContext.Error(err)
		return
	}
	reqContext.JSON(http.StatusOK, interestTagIDs)
}
