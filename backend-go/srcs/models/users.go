package models

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"srcs/token"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type TUser struct {
	/*
		usersテーブルの構造体
	*/
	ID           int       `gorm:"primaryKey;autoIncrement;column:id"`
	Username     string    `gorm:"type:varchar(30);not null;unique;column:username"`
	Email        string    `gorm:"type:varchar(255);not null;unique;column:email"`
	Password     string    `gorm:"type:varchar(60);not null;column:password"`
	DisplayName  string    `gorm:"type:varchar(20);not null;column:display_name"`
	IconImageURL string    `gorm:"type:varchar(255);column:icon_image_url"`
	Introduction string    `gorm:"type:varchar(255);column:introduction"`
	TownName     string    `gorm:"type:varchar(30);column:town_name"`
	CoinCount    int       `gorm:"type:int;not null;column:coin_count"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at"`

	Works    []TWork    `gorm:"foreignKey:UserID;references:ID" json:"-"`
	WorkLogs []TWorkLog `gorm:"foreignKey:UserID;references:ID" json:"-"`

	FriendshipsSent     []TFriendship `gorm:"foreignKey:RequesterID;references:ID" json:"-"`
	FriendshipsReceived []TFriendship `gorm:"foreignKey:ReceiverID;references:ID" json:"-"`
}

func (*TUser) TableName() string {
	/*
		テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "t_users"
}

func (user *TUser) CreateUser() (*TUser, error) {
	/*
		DBに新規ユーザーを保存する関数。
	*/
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user.Password = string(hashedPassword)
	user.Username = strings.ToLower(user.Username)

	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return nil, err
	}
	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now().In(location)
	}

	user.TownName = user.DisplayName + "の町"
	user.CoinCount = 0
	user.Introduction = ""

	err = DB.Create(user).Error
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (user *TUser) PrepareOutput() *TUser {
	/*
		ユーザーデータを返すor出力する前の準備をする関数。
		アウトプットの際はpasswordを非表示に。
	*/
	user.Password = ""
	return user
}

func FetchUserAndGenerateJWTTokenString(username string, email string, password string) (string, error) {
	/*
		JWTトークンを生成する関数。
		usernameかemailからユーザーを識別し、DBから対応するユーザーを取り出す。
		そのユーザーのパスワードが正しいことを確認する。
		ユーザーIDを使用してJWTトークンを生成し返す。
	*/
	var user TUser
	if err := DB.Where("username = ? OR email = ?", username, email).First(&user).Error; err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", err
	}

	jwtTokenString, err := token.GenerateJWTTokenString(uint(user.ID))
	if err != nil {
		return "", err
	}

	return jwtTokenString, nil
}

func GetUserInfo(reqContext *gin.Context) {
	/*
		ユーザーの情報を取得する関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"Error": "Failed to get user id from token"})
		reqContext.Error(err)
		return
	}

	user := &TUser{}
	err = DB.First(&user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"Error": "User not found"})
		reqContext.Error(err)
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"User": user.PrepareOutput(),
	})
}
