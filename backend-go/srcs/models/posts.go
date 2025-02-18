package models

import (
	"os"
	"time"
)

type TPost struct {
	/*
		postsテーブルの構造体
	*/
	ID        int       `gorm:"primaryKey;autoIncrement;column:id"`
	Text      string    `gorm:"type:varchar(30);column:text"`
	IsDraft   bool      `gorm:"type:boolean;column:is_draft"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

func (*TPost) TableName() string { return "t_posts" }

func (post *TPost) CreatePost() (*TPost, error) {
	/*
		DBに新規投稿を保存する関数。
		保存前にCreatedAtを設定する。
	*/
	timeZone := os.Getenv("TIMEZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return nil, err
	}
	if post.CreatedAt.IsZero() {
		post.CreatedAt = time.Now().In(location)
	}

	err = DB.Create(post).Error
	if err != nil {
		return nil, err
	}
	return post, nil
}
