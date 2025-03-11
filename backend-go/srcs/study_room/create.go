package study_room

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"srcs/models"
	"srcs/token"
	"srcs/utils"
)

var StudyRooms = make(map[string]StudyRoom)

type StudyRoom struct {
	StudyRoomName string
	ImageURL      string
	Host          User
	Clients       []User
}

type User struct {
	UserID   int
	Username string
	IconURL  string
	isOnline bool
}

type CreateStudyRoomInput struct {
	StudyRoomName     string `json:"StudyRoomName" binding:"required"`
	StudyRoomImageURL string `json:"StudyRoomImageURL" binding:"required"`
}

func generateRoomCode() (string, error) {
	/*
		ルームコードを作成する関数。
	*/
	for {
		roomCode, err := utils.GenerateRandomCode(6)
		if err != nil {
			return "", err
		}
		if _, isExist := StudyRooms[roomCode]; !isExist {
			return roomCode, nil
		}
	}
}

func createStudyRoom(createStudyRoomInput CreateStudyRoomInput, user models.TUser) StudyRoom {
	/*
		自習室を作成する関数。
	*/
	var studyRoom StudyRoom
	studyRoom.StudyRoomName = createStudyRoomInput.StudyRoomName
	studyRoom.ImageURL = createStudyRoomInput.StudyRoomImageURL
	var host User
	host.UserID = user.ID
	host.Username = user.DisplayName
	host.IconURL = user.IconImageURL
	host.isOnline = true
	studyRoom.Host = host
	studyRoom.Clients = make([]User, 0)
	return studyRoom
}

func CreateStudyRoomHandler(reqContext *gin.Context) {
	/*
		自習室を作成リクエストに対するハンドラー関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"status": "Failed to extract user id"})
		reqContext.Error(err)
		return
	}
	user := &models.TUser{}
	err = models.DB.First(user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"status": "User not found"})
		reqContext.Error(err)
		return
	}

	var createStudyRoomInput CreateStudyRoomInput
	if err := reqContext.ShouldBindJSON(&createStudyRoomInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	roomCode, err := generateRoomCode()
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"status": "Failed to generate room code"})
		reqContext.Error(err)
		return
	}

	StudyRooms[roomCode] = createStudyRoom(createStudyRoomInput, *user)
	reqContext.JSON(http.StatusOK, gin.H{"roomCode": roomCode})
}
