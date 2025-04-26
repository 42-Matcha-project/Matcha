package models

import "time"

type TWorkLog struct {
	ID      int       `gorm:"primaryKey;autoIncrement;column:id"`
	UserID  int       `gorm:"type:int;not null;column:user_id" json:"-"`
	WorkID  int       `gorm:"type:int;not null;column:work_id"`
	Date    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:date"`
	Minutes int64     `gorm:"type:bigint;not null;column:minutes"`
	User    TUser     `gorm:"constraint:OnDelete:CASCADE;foreignKey:UserID;references:ID" json:"-"`
	Work    TWork     `gorm:"constraint:OnDelete:CASCADE;foreignKey:WorkID;constraint:OnDelete:CASCADE;references:ID" json:"-"`
}

func (*TWorkLog) TableName() string { return "t_work_logs" }
