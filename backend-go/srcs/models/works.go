package models

import "srcs/applogs"

type TWork struct {
	/*
		worksテーブルの構造体
	*/
	ID           int        `gorm:"primaryKey;autoIncrement;column:id"`
	UserID       int        `gorm:"type:int;not null;column:user_id" json:"-"`
	WorkName     string     `gorm:"type:varchar(60);not null;column:work_name"`
	IconImageURL string     `gorm:"type:varchar(255);column:icon_image_url"`
	Color        uint32     `gorm:"type:int;not null;column:color"`
	Memo         string     `gorm:"type:varchar(110);column:memo"`
	User         TUser      `gorm:"constraint:OnDelete:CASCADE;foreignKey:UserID;references:ID" json:"-"`
	WorkLogs     []TWorkLog `gorm:"constraint:OnDelete:CASCADE;foreignKey:WorkID;references:ID" json:"-"`
}

func (TWork) TableName() string {
	/*
		テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "t_works"
}
func (work TWork) GetID() int              { return work.ID }
func (work TWork) GetWorkName() string     { return work.WorkName }
func (work TWork) GetIconImageURL() string { return work.IconImageURL }
func (work TWork) GetColor() uint32        { return work.Color }
func (work TWork) GetMemo() string         { return work.Memo }

func ConvertToWorkInfos(works []TWork) []applogs.WorkInfo {
	workInfos := make([]applogs.WorkInfo, len(works))
	for i, work := range works {
		workInfos[i] = work
	}
	return workInfos
}
