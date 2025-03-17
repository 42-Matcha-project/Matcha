package models

import "time"

type TWorkLog struct {
	ID      int       `gorm:"primaryKey;autoIncrement;column:id"`
	UserID  int       `gorm:"type:int;not null;column:user_id" json:"-"`
	WorkID  int       `gorm:"type:int;not null;column:work_id"`
	StartAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:start_at"`
	Minutes int64     `gorm:"type:bigint;not null;column:minutes"`
	User    TUser     `gorm:"foreignKey:UserID;references:ID" json:"-"`
	Work    TWork     `gorm:"foreignKey:WorkID;references:ID" json:"-"`
}

func (*TWorkLog) TableName() string { return "work_logs" }
