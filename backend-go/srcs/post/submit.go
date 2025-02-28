package post

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/token"
)

type SubmitInput struct {
	/*
		提出時にリクエストからJSONデータを抽出するための構造体
	*/
	Text          string   `json:"Text"`
	InterestTags  []string `json:"InterestTags"`
	PostImageUrls []string `json:"PostImageUrls"`
	Location      string   `json:"Location"`
	IsDraft       bool     `json:"IsDraft"`
}

func submitPost(submitInput SubmitInput, userId uint) (*models.TPost, error) {
	/*
		postをDBに保存する関数。
	*/
	var interestTags []models.TInterestTag
	for _, name := range submitInput.InterestTags {
		interestTag := models.TInterestTag{
			Name: name,
		}
		err := models.DB.Where("name = ?", name).FirstOrCreate(&interestTag).Error
		if err != nil {
			return nil, err
		}
		interestTags = append(interestTags, interestTag)
	}

	submitPost := &models.TPost{
		UserID:       userId,
		Text:         submitInput.Text,
		IsDraft:      submitInput.IsDraft,
		InterestTags: interestTags,
	}

	var err error
	submitPost, err = submitPost.CreatePost()
	return submitPost, err
}

func submitPostImageUrls(submitInput SubmitInput, post_id int) error {
	/*
		PostImageUrlsと登録する関数。
	*/
	if submitInput.PostImageUrls != nil && len(submitInput.PostImageUrls) != 0 {
		for i := 0; i < len(submitInput.PostImageUrls); i++ {
			var postImageUrls models.TPostImageURL
			err := models.DB.FirstOrCreate(&postImageUrls, models.TPostImageURL{
				PostID:       post_id,
				PostImageUrl: submitInput.PostImageUrls[i],
			}).Error
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func Submit(reqContext *gin.Context) {
	/*
		新規投稿を提出する関数。
		リクエストからJSONデータを抽出してDBに保存する。
		成功すればstatus200と保存した投稿のデータを返す。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}
	user := &models.TUser{}
	err = models.DB.First(user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		reqContext.Error(err)
		return
	}

	var submitInput SubmitInput

	if err := reqContext.ShouldBindJSON(&submitInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	post, err := submitPost(submitInput, userId)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to submit post"})
		reqContext.Error(err)
		return
	}

	if err = submitPostImageUrls(submitInput, post.ID); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to submit post image urls"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"post": post,
	})
}
