package models

import (
	"errors"
	"gorm.io/gorm"
)

type TPostImageURL struct {
	/*
		post_image_urlsテーブルの構造体
	*/
	ID           int    `gorm:"primaryKey;autoIncrement;column:id"`
	PostID       int    `gorm:"type:int(10);not null;column:post_id"`
	PostImageUrl string `gorm:"type:varchar(255);not null;column:post_image_url"`
	Post         TPost  `gorm:"foreignKey:PostID;references:ID"`
}

func (*TPostImageURL) TableName() string { return "t_post_image_urls" }

func (postImageUrl *TPostImageURL) CreatePostImageURL() (*TPostImageURL, error) {
	/*
		DBに新規投稿画像URLを保存する関数。
		post_idとpost_image_urlの組が一致するものがすでにある場合はCreateしない。
	*/
	err := DB.Where("post_id = ? AND post_image_url = ?", postImageUrl.PostID, postImageUrl.PostImageUrl).First(postImageUrl).Error
	if err == nil {
		return postImageUrl, nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = DB.Create(postImageUrl).Error
		if err != nil {
			return nil, err
		}
		return postImageUrl, nil
	}

	return nil, err
}
