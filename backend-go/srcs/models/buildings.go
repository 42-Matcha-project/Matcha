package models

import (
	"database/sql"
	"srcs/applogs"
)

type TUserBuilding struct {
	ID         int `gorm:"primaryKey;autoIncrement;column:id" json:"-"`
	UserID     int `gorm:"type:int;not null;column:t_user_id" json:"-"`
	BuildingID int `gorm:"type:int;not null;column:t_building_id" json:"-"`
	PlaceIndex int `gorm:"type:int;not null;column:place_index;default:0"`

	User     TUser     `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Building TBuilding `gorm:"foreignKey:BuildingID;references:ID;constraint:OnDelete:CASCADE"`
}

func (TUserBuilding) TableName() string { return "t_user_buildings" }

func (userBuilding TUserBuilding) GetPlaceIndex() int {
	return userBuilding.PlaceIndex
}

func (userBuilding TUserBuilding) GetBuilding() applogs.BuildingInfo {
	return userBuilding.Building
}

func ConvertToUserBuildingInfos(userBuildings []TUserBuilding) []applogs.UserBuildingInfo {
	buildingInfos := make([]applogs.UserBuildingInfo, len(userBuildings))
	for i, userBuilding := range userBuildings {
		buildingInfos[i] = userBuilding
	}
	return buildingInfos
}

type TBuilding struct {
	ID                int          `gorm:"primaryKey;autoIncrement;column:id"`
	ExteriorImageURL  string       `gorm:"type:varchar(255);not null;column:exterior_image_url"`
	InteriorImageURL  string       `gorm:"type:varchar(255);not null;column:interior_image_url"`
	DefaultName       string       `gorm:"type:varchar(30);not null;column:default_name"`
	CustomName        string       `gorm:"type:varchar(30);not null;column:custom_name"`
	RequiredCoinCount int          `gorm:"type:int;not null;column:required_coin_count"`
	IsInStore         bool         `gorm:"type:bool;not null;column:is_in_store"`
	SaleStartTime     sql.NullTime `gorm:"type:timestamp;column:sale_start_time"`
	SaleEndTime       sql.NullTime `gorm:"type:timestamp;column:sale_end_time"`

	Users []TUser `gorm:"many2many:t_user_buildings" json:"-"`
}

func (TBuilding) TableName() string { return "t_buildings" }

func (building TBuilding) GetID() int {
	return building.ID
}

func (building TBuilding) GetExteriorImageURL() string {
	return building.ExteriorImageURL
}

func (building TBuilding) GetInteriorImageURL() string {
	return building.InteriorImageURL
}

func (building TBuilding) GetDefaultName() string {
	return building.DefaultName
}

func (building TBuilding) GetCustomName() string {
	return building.CustomName
}

func ConvertToBuildingInfos(buildings []TBuilding) []applogs.BuildingInfo {
	buildingInfos := make([]applogs.BuildingInfo, len(buildings))
	for i, building := range buildings {
		buildingInfos[i] = building
	}
	return buildingInfos
}
