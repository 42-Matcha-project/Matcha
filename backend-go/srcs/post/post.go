package post

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
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

func submitPost(submitInput SubmitInput) (*models.TPost, error) {
	/*
		postをDBに保存する関数。
	*/
	submitPost := &models.TPost{
		Text:    submitInput.Text,
		IsDraft: submitInput.IsDraft,
	}

	var err error
	submitPost, err = submitPost.CreatePost()
	return submitPost, err
}

func submitInterestTags(submitInput SubmitInput, post_id int) error {
	/*
		InterestTagsを登録する関数。
	*/
	var err error
	if submitInput.InterestTags != nil && len(submitInput.InterestTags) != 0 {
		for i := 0; i < len(submitInput.InterestTags); i++ {
			interestTag := &models.TInterestTag{
				Name: submitInput.InterestTags[i],
			}
			interestTag, err = interestTag.CreateInterestTag()
			if err != nil {
				return err
			}

			postInterestTag := &models.TPostInterestTag{
				PostID:        post_id,
				InterestTagID: interestTag.ID,
			}
			postInterestTag, err = postInterestTag.CreatePostInterestTag()
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
	var submitInput SubmitInput

	if err := reqContext.ShouldBindJSON(&submitInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	post, err := submitPost(submitInput)
	if err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to submit post"})
		reqContext.Error(err)
		return
	}

	if err = submitInterestTags(submitInput, post.ID); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Failed to submit interest tags"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"post": post,
	})
}
