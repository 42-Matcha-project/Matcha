package models

type TFriendship struct {
	/*
		friendshipsテーブルの構造体
	*/
	ID          int  `gorm:"primaryKey;autoIncrement;column:id"`
	RequesterID int  `gorm:"type:int;column:requester_id;constraint:OnDelete:CASCADE"`
	ReceiverID  int  `gorm:"type:int;column:receiver_id;constraint:OnDelete:CASCADE"`
	IsPending   bool `gorm:"column:is_pending;default:true"`

	Requester TUser `gorm:"foreignKey:RequesterID;references:ID" json:"-"`
	Receiver  TUser `gorm:"foreignKey:ReceiverID;references:ID" json:"-"`
}

func (friendship *TFriendship) TableName() string { return "t_friendships" }

func (friendship *TFriendship) GetRequesterID() int { return friendship.RequesterID }
func (friendship *TFriendship) GetReceiverID() int  { return friendship.ReceiverID }
func (friendship *TFriendship) GetIsPending() bool  { return friendship.IsPending }
