package models

import (
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

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

func (*User) TableName() string {
	/*
		テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "t_users"
}

func (inputUser *User) Save() (*User, error) {
	/*
		DBに新規ユーザーを保存する関数。
	*/
	err := DB.Create(inputUser).Error
	if err != nil {
		return nil, err
	}
	return inputUser, nil
}

func (inputUser *User) BeforeSave(*gorm.DB) error {
	/*
		Saveが実行される直前に自動で呼ばれる関数。
		DBに保存する前にpasswordをハッシュ化、usernameを小文字にする。
		created_atとupdated_atを設定。
	*/
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(inputUser.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	inputUser.Password = string(hashedPassword)
	inputUser.Username = strings.ToLower(inputUser.Username)
	location, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		return err
	}
	if inputUser.CreatedAt.IsZero() {
		inputUser.CreatedAt = time.Now().In(location)
	}
	if inputUser.UpdatedAt.IsZero() {
		inputUser.UpdatedAt = time.Now().In(location)
	}
	return nil
}

func (user *User) PrepareOutput() *User {
	/*
		ユーザーデータを返すor出力する前の準備をする関数。
		アウトプットの際はpasswordを非表示に。
	*/
	user.Password = ""
	return user
}
