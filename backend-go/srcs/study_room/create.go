package study_room

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	"srcs/models"
	"srcs/utils"
	"sync"
)

var (
	StudyRoomsMutex sync.Mutex
	StudyRooms      = make(map[string]*StudyRoom)
)

type StudyRoom struct {
	StudyRoomName string
	ImageURL      string
	Clients       map[int]*User
	Mutex         *sync.Mutex
}

type User struct {
	UserId   int
	Username string
	IconURL  string
	Status   string
	IsHost   bool
	Conn     *websocket.Conn
}

type CreateStudyRoomInput struct {
	StudyRoomName     string `json:"StudyRoomName" binding:"required"`
	StudyRoomImageURL string `json:"StudyRoomImageURL" binding:"required"`
}

func generateRoomCode() (string, error) {
	/*
		ルームコードを作成する関数。
	*/
	StudyRoomsMutex.Lock()
	defer StudyRoomsMutex.Unlock()
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

func createStudyRoom(createStudyRoomInput CreateStudyRoomInput, user models.TUser) *StudyRoom {
	/*
		自習室を作成する関数。
	*/
	studyRoom := &StudyRoom{
		StudyRoomName: createStudyRoomInput.StudyRoomName,
		ImageURL:      createStudyRoomInput.StudyRoomImageURL,
		Clients:       make(map[int]*User),
		Mutex:         &sync.Mutex{},
	}
	host := &User{
		UserId:   user.ID,
		Username: user.Username,
		IconURL:  user.IconImageURL,
		Status:   "Online",
		IsHost:   true,
		Conn:     nil,
	}
	studyRoom.Mutex.Lock()
	defer studyRoom.Mutex.Unlock()
	studyRoom.Clients[user.ID] = host
	return studyRoom
}

func CreateStudyRoomHandler(reqContext *gin.Context) {
	/*
		自習室を作成リクエストに対するハンドラー関数。
	*/
	user, err := utils.ExtractUserFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	var createStudyRoomInput CreateStudyRoomInput
	if err := reqContext.ShouldBindJSON(&createStudyRoomInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid json input"})
		reqContext.Error(err)
		return
	}

	roomCode, err := generateRoomCode()
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"Status": "Failed to generate room code"})
		reqContext.Error(err)
		return
	}

	StudyRoomsMutex.Lock()
	StudyRooms[roomCode] = createStudyRoom(createStudyRoomInput, *user)
	StudyRoomsMutex.Unlock()
	reqContext.JSON(http.StatusOK, gin.H{"RoomCode": roomCode})
}
