package models

type TWork struct {
	/*
		worksテーブルの構造体
	*/
	ID           int    `gorm:"primaryKey;autoIncrement;colum:id"`
	UserID       int    `gorm:"type:int;not null;column:user_id" json:"-"`
	WorkName     string `gorm:"type:varchar(60);not null;column:work_name"`
	IconImageURL string `gorm:"type:varchar(255);column:icon_image_url"`
	User         TUser  `gorm:"foreignKey:UserID;references:ID" json:"-"`
}

func (*TWork) TableName() string {
	/*
		テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "t_works"
}
