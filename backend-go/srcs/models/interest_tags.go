package models

import (
	"errors"
	"gorm.io/gorm"
)

type TInterestTag struct {
	/*
		t_interest_tagsテーブルの構造体
	*/
	ID   int    `gorm:"primaryKey;autoIncrement;column:id"`
	Name string `gorm:"type:varchar(100);not null;unique;gorm:column:name"`
}

func (*TInterestTag) TableName() string { return "t_interest_tags" }

type TPostInterestTag struct {
	ID            int `gorm:"primaryKey;autoIncrement;column:id"`
	PostID        int `gorm:"type:int(11);not null;gorm:column:post_id"`
	InterestTagID int `gorm:"type:int(11);not null;gorm:column:interest_tag_id"`
}

func (*TPostInterestTag) TableName() string { return "t_post_interest_tags" }

func (interestTag *TInterestTag) CreateInterestTag() (*TInterestTag, error) {
	/*
		DBに新規趣味タグを保存する関数。
		nameはuniqueなのでCreate前にチェック
	*/
	err := DB.Where("name = ?", interestTag.Name).First(interestTag).Error
	if err == nil {
		return interestTag, err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = DB.Create(interestTag).Error
		if err != nil {
			return nil, err
		}
		return interestTag, nil
	}

	return nil, err
}

func (postInterestTag *TPostInterestTag) CreatePostInterestTag() (*TPostInterestTag, error) {
	/*
		DBにpostとinterest_tagの中間テーブルの列を保存する関数。
		post_idとinterest_tag_idの組が一致する列がすでに存在する場合はCreateしない。
	*/
	err := DB.Where("post_id = ? AND interest_tag_id = ?", postInterestTag.PostID, postInterestTag.InterestTagID).First(postInterestTag).Error
	if err == nil {
		return postInterestTag, err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = DB.Create(postInterestTag).Error
		if err != nil {
			return nil, err
		}
		return postInterestTag, nil
	}

	return nil, err
}
