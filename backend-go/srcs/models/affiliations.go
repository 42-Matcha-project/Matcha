package models

import (
	"errors"
	"gorm.io/gorm"
)

type TAffiliation struct {
	/*
		t_affiliationsテーブルの構造体
	*/
	ID     int     `gorm:"primaryKey;autoIncrement;column:id"`
	Name   string  `gorm:"type:varchar(100);not null;unique;gorm:column:name"`
	TUsers []TUser `gorm:"many2many:t_user_affiliations;"`
}

func (TAffiliation) TableName() string { return "t_affiliations" }

func (affiliation *TAffiliation) CreateAffiliation() (*TAffiliation, error) {
	/*
		DBに新規所属を保存する関数。
		affiliationはuniqueなのでCreateの前にチェック
	*/
	err := DB.Where("affiliation = ?", affiliation.Name).First(affiliation).Error
	if err == nil {
		return affiliation, nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = DB.Create(affiliation).Error
		if err != nil {
			return nil, err
		}
		return affiliation, nil
	}

	return nil, err
}
