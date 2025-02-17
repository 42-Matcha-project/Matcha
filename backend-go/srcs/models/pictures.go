package models

import (
	"errors"
	"gorm.io/gorm"
)

type TPicture struct {
	/*
		t_picturesテーブルの構造体
	*/
	ID         int    `gorm:"primaryKey;autoIncrement;column:id"`
	UserID     int    `gorm:"type:varchar(100);not null;gorm:column:user_id"`
	PictureURL string `gorm:"type:varchar(255);not null;column:picture_url"`
}

func (*TPicture) TableName() string { return "t_pictures" }

func (picture *TPicture) CreatePicture() (*TPicture, error) {
	/*
		DBにPictureを保存する関数。
		user_idとpicture_urlの組が一致するものがすでにある場合はCreateしない。
	*/
	err := DB.Where("user_id = ? AND picture_url = ?", picture.UserID, picture.PictureURL).First(&picture).Error
	if err == nil {
		return picture, nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = DB.Create(&picture).Error
		if err != nil {
			return nil, err
		}
		return picture, nil
	}

	return nil, err
}
