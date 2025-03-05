package models

type TInterestTag struct {
	/*
		t_interest_tagsテーブルの構造体
	*/
	ID    int     `gorm:"primaryKey;autoIncrement;column:id"`
	Name  string  `gorm:"type:varchar(100);not null;unique;gorm:column:name"`
	Users []TUser `gorm:"many2many:t_user_interest_tags;"  json:"-"`
	Posts []TPost `gorm:"many2many:t_post_interest_tags;" json:"-"`
}

func (*TInterestTag) TableName() string { return "t_interest_tags" }
