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

type ResponseOptions struct {
	OTP           string
	Token         string
	Building      BuildingInfo
	Buildings     []BuildingInfo
	UserBuilding  UserBuildingInfo
	UserBuildings []UserBuildingInfo
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

	return JSONResponse
}
