package models

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"reflect"
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
	Gender       string    `gorm:"type:enum('male','female');not null;column:gender"`
	Introduction string    `gorm:"type:varchar(255);column:introduction"`
	IconImageURL string    `gorm:"type:varchar(255);column:icon_image_url"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;column:created_at"`
	UpdatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP;column:updated_at"`
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
	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = time.Now().In(location)
	}
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
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	user := &TUser{}
	err = DB.First(&user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"user": user.PrepareOutput(),
	})
}

type ChangeUserInfoInput struct {
	/*
		登録時にリクエストからJSONデータを抽出するための構造体。
	*/
	Password     string `json:"Password"`
	DisplayName  string `json:"DisplayName"`
	Gender       string `json:"Gender"`
	Introduction string `json:"Introduction"`
	IconImageUrl string `json:"IconImageUrl"`
}

func (user *TUser) UpdateUser(input ChangeUserInfoInput) error {
	/*
		ユーザーのDBを更新する関数。
		列ごとに更新していく。
	*/
	inputValue := reflect.ValueOf(input)
	for i := 0; i < inputValue.NumField(); i++ {
		inputFieldName := inputValue.Type().Field(i).Name
		inputFieldValue := inputValue.Field(i).Interface()

		if inputFieldValue == "" {
			continue
		}

		err := DB.Model(user).Update(inputFieldName, inputFieldValue).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func ChangeUserInfo(reqContext *gin.Context) {
	/*
		ユーザーの情報を更新する関数。
		リクエストからuserのidを取得しDBから取り出す。
		そのユーザーの情報を更新する。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	user := &TUser{}
	err = DB.First(&user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	var changeUserInfoInput ChangeUserInfoInput
	if err := reqContext.ShouldBindJSON(&changeUserInfoInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := user.UpdateUser(changeUserInfoInput); err != nil {
		reqContext.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"data": user.PrepareOutput(),
	})
}

func DeleteUser(reqContext *gin.Context) {
	/*
		DBからユーザーを削除する関数。
	*/
	userId, err := token.ExtractUserIdFromRequest(reqContext)
	if err != nil {
		reqContext.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	user := &TUser{}
	err = DB.First(&user, userId).Error
	if err != nil {
		reqContext.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err = DB.Delete(user).Error
	if err != nil {
		reqContext.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	reqContext.JSON(http.StatusOK, gin.H{
		"status": "success",
	})
}
