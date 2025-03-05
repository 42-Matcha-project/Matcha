package models

type TPostImageURL struct {
	/*
		post_image_urlsテーブルの構造体
	*/
	ID           int    `gorm:"primaryKey;autoIncrement;column:id"`
	PostID       int    `gorm:"type:int(10);not null;column:post_id" json:"-"`
	PostImageUrl string `gorm:"type:varchar(255);not null;column:post_image_url"`
	Post         TPost  `gorm:"foreignKey:PostID;references:ID" json:"-"`
}

func (*TPostImageURL) TableName() string { return "t_post_image_urls" }
