package applogs

import (
	"github.com/gin-gonic/gin"
)

type BuildingInfo interface {
	GetID() int
	GetExteriorImageURL() string
	GetInteriorImageURL() string
	GetDefaultName() string
	GetCustomName() string
}

type UserBuildingInfo interface {
	GetPlaceIndex() int
	GetBuilding() BuildingInfo
}

type FriendshipInfo interface {
	GetRequesterID() int
	GetReceiverID() int
	GetIsPending() bool
}

type OtherUserInfo interface {
	GetID() int
	GetUsername() string
	GetDisplayName() string
	GetIconImageURL() string
	GetIntroduction() string
}

type ResponseOptions struct {
	OTP           string
	Token         string
	Building      BuildingInfo
	Buildings     []BuildingInfo
	UserBuilding  UserBuildingInfo
	UserBuildings []UserBuildingInfo
	Friendship    FriendshipInfo
	Friends       []OtherUserInfo
}

func CreateJSONResponseByResponseCode(responseCode int, options ResponseOptions) gin.H {
	JSONResponse := gin.H{
		"ResponseCode": responseCode,
		"Message":      Message[responseCode],
	}

	if options.OTP != "" {
		JSONResponse["OTP"] = options.OTP
	}

	if options.Token != "" {
		JSONResponse["Token"] = options.Token
	}

	if options.Building != nil {
		JSONResponse["Building"] = gin.H{
			"ID":               options.Building.GetID(),
			"ExteriorImageURL": options.Building.GetExteriorImageURL(),
			"InteriorImageURL": options.Building.GetInteriorImageURL(),
			"DefaultName":      options.Building.GetDefaultName(),
			"CustomName":       options.Building.GetCustomName(),
		}
	}

	if options.Buildings != nil {
		buildings := make([]gin.H, 0, len(options.Buildings))
		for _, buildingInfo := range options.Buildings {
			buildings = append(buildings, gin.H{
				"ID":               buildingInfo.GetID(),
				"ExteriorImageURL": buildingInfo.GetExteriorImageURL(),
				"InteriorImageURL": buildingInfo.GetInteriorImageURL(),
				"DefaultName":      buildingInfo.GetDefaultName(),
				"CustomName":       buildingInfo.GetCustomName(),
			})
		}
		JSONResponse["Buildings"] = buildings
	}

	if options.UserBuilding != nil {
		building := options.UserBuilding.GetBuilding()
		JSONResponse["BuildingWithPlaceIndex"] = gin.H{
			"ID":               building.GetID(),
			"ExteriorImageURL": building.GetExteriorImageURL(),
			"InteriorImageURL": building.GetInteriorImageURL(),
			"DefaultName":      building.GetDefaultName(),
			"CustomName":       building.GetCustomName(),
			"PlaceIndex":       options.UserBuilding.GetPlaceIndex(),
		}
	}

	if options.UserBuildings != nil {
		buildingsWithPlaceIndex := make([]gin.H, 0, len(options.UserBuildings))
		for _, userBuilding := range options.UserBuildings {
			building := userBuilding.GetBuilding()
			buildingsWithPlaceIndex = append(buildingsWithPlaceIndex, gin.H{
				"ID":               building.GetID(),
				"ExteriorImageURL": building.GetExteriorImageURL(),
				"InteriorImageURL": building.GetInteriorImageURL(),
				"DefaultName":      building.GetDefaultName(),
				"CustomName":       building.GetCustomName(),
				"PlaceIndex":       userBuilding.GetPlaceIndex(),
			})
		}
		JSONResponse["BuildingsWithPlaceIndex"] = buildingsWithPlaceIndex
	}

	if options.Friendship != nil {
		JSONResponse["Friendship"] = gin.H{
			"RequesterID": options.Friendship.GetRequesterID(),
			"ReceiverID":  options.Friendship.GetReceiverID(),
			"IsPending":   options.Friendship.GetIsPending(),
		}
	}

	if options.Friends != nil {
		friends := make([]gin.H, 0, len(options.Friends))
		for _, friend := range options.Friends {
			friends = append(friends, gin.H{
				"ID":           friend.GetID(),
				"Username":     friend.GetUsername(),
				"DisplayName":  friend.GetDisplayName(),
				"IconImageURL": friend.GetIconImageURL(),
				"Introduction": friend.GetIntroduction(),
			})
		}
		JSONResponse["Friends"] = friends
	}

	return JSONResponse
}
