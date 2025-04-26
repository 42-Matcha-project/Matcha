package applogs

import (
	"github.com/gin-gonic/gin"
	"time"
)

type BuildingInfo interface {
	GetID() int
	GetExteriorImageURL() string
	GetInteriorImageURL() string
	GetDefaultName() string
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

type SelfUserInfo interface {
	GetID() int
	GetUsername() string
	GetEmail() string
	GetDisplayName() string
	GetIconImageURL() string
	GetIntroduction() string
	GetTownName() string
	GetCoinCount() int
}

type WorkInfo interface {
	GetID() int
	GetWorkName() string
	GetIconImageURL() string
	GetColor() uint32
	GetMemo() string
}

type WorkLogInfo interface {
	GetWorkID() int
	GetWorkName() string
	GetDate() time.Time
	GetMinutes() int64
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
	Me            SelfUserInfo
	RoomCode      string
	Work          WorkInfo
	Works         []WorkInfo
	WorkLogs      []WorkLogInfo
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

	if options.Me != nil {
		JSONResponse["Me"] = gin.H{
			"ID":           options.Me.GetID(),
			"Username":     options.Me.GetUsername(),
			"Email":        options.Me.GetEmail(),
			"DisplayName":  options.Me.GetDisplayName(),
			"IconImageURL": options.Me.GetIconImageURL(),
			"Introduction": options.Me.GetIntroduction(),
			"TownName":     options.Me.GetTownName(),
			"CoinCount":    options.Me.GetCoinCount(),
		}
	}

	if options.RoomCode != "" {
		JSONResponse["RoomCode"] = options.RoomCode
	}

	if options.Work != nil {
		JSONResponse["Work"] = gin.H{
			"ID":           options.Work.GetID(),
			"WorkName":     options.Work.GetWorkName(),
			"IconImageURL": options.Work.GetIconImageURL(),
			"Color":        options.Work.GetColor(),
			"Memo":         options.Work.GetMemo(),
		}
	}

	if options.Works != nil {
		works := make([]gin.H, 0, len(options.Works))
		for _, work := range options.Works {
			works = append(works, gin.H{
				"ID":           work.GetID(),
				"WorkName":     work.GetWorkName(),
				"IconImageURL": work.GetIconImageURL(),
				"Color":        work.GetColor(),
				"Memo":         work.GetMemo(),
			})
		}
		JSONResponse["Works"] = works
	}

	if options.WorkLogs != nil {
		workLogs := make([]gin.H, 0, len(options.WorkLogs))
		for _, workLog := range options.WorkLogs {
			workLogs = append(workLogs, gin.H{
				"ID":       workLog.GetWorkID(),
				"WorkName": workLog.GetWorkName(),
				"Date":     workLog.GetDate(),
				"Minutes":  workLog.GetMinutes(),
			})
		}
		JSONResponse["WorkLogs"] = workLogs
	}

	return JSONResponse
}
