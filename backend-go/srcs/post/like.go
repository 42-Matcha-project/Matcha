package post

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/token"
)

type LikeInput struct {
	/*
		いいね時にリクエストからJSONデータを抽出するための構造体。
	*/
	PostID int  `json:"PostID" binding:"required"`
	IsLike bool `json:"IsLike"`
}

func Like(reqContext *gin.Context) {
	/*
		投稿にいいねをする関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}

	var likeInput LikeInput
	err = reqContext.ShouldBindJSON(&likeInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	post := &models.TPost{}
	err = models.DB.Where("id = ?", likeInput.PostID).First(post).Error
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Post not found"})
		reqContext.Error(err)
		return
	}

}
