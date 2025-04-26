package models

type TUserCharacter struct {
	ID          int  `gorm:"primaryKey;autoIncrement;column:id" json:"-"`
	UserID      int  `gorm:"type:int;not null;column:t_user_id" json:"-"`
	CharacterID int  `gorm:"type:int;not null;column:t_character_id" json:"-"`
	IsMain      bool `gorm:"type:boolean;not null;column:is_main" default:"false"`

	User      TUser      `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Character TCharacter `gorm:"foreignKey:CharacterID;references:ID;constraint:OnDelete:CASCADE"`
}

func (model TUserCharacter) TableName() string { return "t_user_characters" }

type TCharacter struct {
	ID                int    `gorm:"primaryKey;autoIncrement;column:id"`
	ImageURL          string `gorm:"type:varchar(255);not null;column:image_url"`
	DefaultName       string `gorm:"type:varchar(30);not null;column:default_name"`
	RequiredCoinCount int    `gorm:"type:int;not null;column:required_coin_count"`
	IsInStore         bool   `gorm:"type:bool;not null;column:is_in_store"`

	Users []TUser `gorm:"many2many:t_user_characters" json:"-"`
}

func (TCharacter) TableName() string { return "t_characters" }
