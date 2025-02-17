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

type TUserInterestTag struct {
	/*
		t_user_interest_tagsテーブルの構造体
		t_userとt_interest_tagsの中間テーブル
	*/
	ID            int `gorm:"primaryKey;autoIncrement;column:id"`
	UserID        int `gorm:"type:int(11);not null;gorm:column:user_id"`
	InterestTagID int `gorm:"type:int(11);not null;gorm:column:interest_tag_id"`
}

func (*TUserInterestTag) TableName() string { return "t_user_interest_tags" }

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

func (userInterestTag *TUserInterestTag) CreateUserInterestTag() (*TUserInterestTag, error) {
	/*
		DBにユーザーと趣味タグの中間テーブルの列を保存する関数。
		user_idとinterest_tag_idの組が一致するものがすでにある場合はCreateしない。
	*/
	err := DB.Where("user_id = ? AND interest_tag_id = ?", userInterestTag.UserID, userInterestTag.InterestTagID).First(userInterestTag).Error
	if err == nil {
		return userInterestTag, err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = DB.Create(userInterestTag).Error
		if err != nil {
			return nil, err
		}
		return userInterestTag, nil
	}

	return nil, err
}
