package models

type TOTP struct {
	/*
		OneTimePasswordテーブルの構造体
	*/
	ID    int    `gorm:"primaryKey;autoIncrement;column:id"`
	Email string `gorm:"type:varchar(6);not null;unique;column:email"`
	OTP   string `gorm:"type:varchar(6);not null;column:otp"`
}

func (*TOTP) TableName() string { return "t_otp" }
