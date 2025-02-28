package models

type TAffiliation struct {
	/*
		t_affiliationsテーブルの構造体
	*/
	ID     int     `gorm:"primaryKey;autoIncrement;column:id"`
	Name   string  `gorm:"type:varchar(100);not null;unique;gorm:column:name"`
	TUsers []TUser `gorm:"many2many:t_user_affiliations;"`
}

func (TAffiliation) TableName() string { return "t_affiliations" }
