package models

type TPicture struct {
	/*
		t_picturesテーブルの構造体
	*/
	ID         int    `gorm:"primaryKey;autoIncrement;column:id"`
	UserID     int    `gorm:"type:varchar(100);not null;gorm:column:user_id"`
	PictureURL string `gorm:"type:varchar(255);not null;column:picture_url"`
	User       TUser  `gorm:"foreignkey:UserID;references:ID"`
}

func (*TPicture) TableName() string { return "t_pictures" }
