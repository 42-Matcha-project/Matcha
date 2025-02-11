package models

type User struct {
	/*
		usersテーブルの構造体
	*/
	ID           int    `gorm:"primaryKey;autoIncrement"`
	Username     string `gorm:"type:varchar(30);not null;unique"`
	Email        string `gorm:"type:varchar(255);not null;unique"`
	Password     string `gorm:"type:varchar(60);not null"`
	DisplayName  string `gorm:"type:varchar(20);not null"`
	Gender       string `gorm:"type:enum('male','female');not null"`
	Introduction string `gorm:"type:varchar(255)"`
	IconImageURL string `gorm:"type:varchar(255)"`
	CreatedAt    string `gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt    string `gorm:"type:timestamp;default:CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP"`
}

func (User) TableName() string {
	/*
			テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "users"
}
