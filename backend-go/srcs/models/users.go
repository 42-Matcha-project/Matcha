package models

import "time"

type User struct {
	/*
		usersテーブルの構造体
	*/
	ID           int       `gorm:"primaryKey;autoIncrement;column:id"`
	Username     string    `gorm:"type:varchar(30);not null;unique;column:username"`
	Email        string    `gorm:"type:varchar(255);not null;unique;column:email"`
	Password     string    `gorm:"type:varchar(60);not null;column:password"`
	DisplayName  string    `gorm:"type:varchar(20);not null;column:display_name"`
	Gender       string    `gorm:"type:enum('male','female');not null;column:gender"`
	Introduction string    `gorm:"type:varchar(255);column:introduction"`
	IconImageURL string    `gorm:"type:varchar(255);column:icon_image_url"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at"`
	UpdatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP;column:updated_at"`
}

func (User) TableName() string {
	/*
			テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "users"
}
