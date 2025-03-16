package models

import "time"

type TWorkLog struct {
	ID      int       `gorm:"primaryKey;autoIncrement;column:id"`
	UserID  int       `gorm:"type:int;not null;column:user_id" json:"-"`
	WorkID  int       `gorm:"type:int;not null;column:work_id" json:"-"`
	StartAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:start_at"`
	User    TUser     `gorm:"foreignKey:UserId;references:ID" json:"-"`
	Work    TWork     `gorm:"foreignKey:WorkId;references:ID" json:"-"`
}

func (*TWorkLog) TableName() string { return "work_logs" }
