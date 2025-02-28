package models

import (
	"errors"
	"gorm.io/gorm"
)

type TInterestTag struct {
	/*
		t_interest_tagsテーブルの構造体
	*/
	ID    int     `gorm:"primaryKey;autoIncrement;column:id"`
	Name  string  `gorm:"type:varchar(100);not null;unique;gorm:column:name"`
	Users []TUser `gorm:"many2many:t_user_interest_tags;"`
	Posts []TPost `gorm:"many2many:t_post_interest_tags;"`
}

func (*TInterestTag) TableName() string { return "t_interest_tags" }

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
