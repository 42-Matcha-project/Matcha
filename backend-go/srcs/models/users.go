package models

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
	"net/http"
	"os"
	"srcs/applogs"
	"srcs/token"
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

	Buildings []TBuilding `gorm:"many2many:t_user_buildings" json:"-"`

	FriendshipsSent     []TFriendship `gorm:"foreignKey:RequesterID;references:ID" json:"-"`
	FriendshipsReceived []TFriendship `gorm:"foreignKey:ReceiverID;references:ID" json:"-"`

	Characters []TCharacter `gorm:"many2many:t_user_characters" json:"-"`
}

func (TUser) TableName() string {
	/*
		テーブル名を明示的に指定する関数。
		AutoMigrateの際に自動で参照される。
	*/
	return "t_users"
}

func (user TUser) GetID() int              { return user.ID }
func (user TUser) GetUsername() string     { return user.Username }
func (user TUser) GetEmail() string        { return user.Email }
func (user TUser) GetDisplayName() string  { return user.DisplayName }
func (user TUser) GetIconImageURL() string { return user.IconImageURL }
func (user TUser) GetIntroduction() string { return user.Introduction }
func (user TUser) GetTownName() string     { return user.TownName }
func (user TUser) GetCoinCount() int       { return user.CoinCount }

func ConvertToOtherUsersInfos(users []TUser) []applogs.OtherUserInfo {
	otherUserInfos := make([]applogs.OtherUserInfo, len(users))
	for i, user := range users {
		otherUserInfos[i] = user
	}
	return otherUserInfos
}

func (user TUser) DeductCoins(requiredCoinCount int) error {
	if user.CoinCount < requiredCoinCount {
		return errors.New("Not enough coins")
	}
	user.CoinCount -= requiredCoinCount
	err := DB.Save(&user).Error
	return err
}

func (user TUser) IsCharacterIDOwned(characterID int) (bool, error) {
	err := DB.Where("t_character_id = ? AND t_user_id = ?", characterID, user.ID).First(&TUserCharacter{}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	} else if err != nil {
		return false, err
	}
	return true, nil
}

func (user TUser) IsBuildingIDOwned(buildingID int) (bool, error) {
	err := DB.Where("t_building_id = ? AND t_user_id = ?", buildingID, user.ID).First(&TUserBuilding{}).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	} else if err != nil {
		return false, err
	}
	return true, nil
}

func (user TUser) CreateUser() (TUser, error, int) {
	/*
		DBに新規ユーザーを保存する関数。
	*/
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return user, err, applogs.FailedToHashPassword
	}

	user.Password = string(hashedPassword)

	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	if err != nil {
		return user, err, applogs.FailedToLoadTimeZone
	}
	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now().In(location)
	}

	user.TownName = user.DisplayName + "の町"
	user.CoinCount = 0
	user.Introduction = ""

	err = DB.Create(&user).Error
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		switch pgErr.ConstraintName {
		case "uni_t_users_email":
			return user, err, applogs.EmailForUserAlreadyExists
		case "uni_t_users_username":
			return user, err, applogs.UserNameForUserAlreadyExists
		default:
			return user, err, applogs.FailedToCreateUser
		}
	}
	if err != nil {
		return user, err, applogs.FailedToCreateUser
	}
	return user, nil, applogs.CreateUserSuccess
}

func (user TUser) PrepareOutput() TUser {
	/*
		ユーザーデータを返すor出力する前の準備をする関数。
		アウトプットの際はpasswordを非表示に。
	*/
	user.Password = ""
	return user
}

func PrepareOutput(users []*TUser) []*TUser {
	for _, user := range users {
		user.PrepareOutput()
	}
	return users
}

func FetchUserAndGenerateJWTTokenString(username string, email string, password string) (string, error, int) {
	/*
		JWTトークンを生成する関数。
		usernameかemailからユーザーを識別し、DBから対応するユーザーを取り出す。
		そのユーザーのパスワードが正しいことを確認する。
		ユーザーIDを使用してJWTトークンを生成し返す。
	*/
	var user TUser
	if err := DB.Where("username = ? OR email = ?", username, email).First(&user).Error; err != nil {
		return "", err, applogs.UserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", err, applogs.FailedToHashPassword
	}

	jwtTokenString, err := token.GenerateJWTTokenString(uint(user.ID))
	if err != nil {
		return "", err, applogs.FailedToGenerateJWTToken
	}

	return jwtTokenString, nil, applogs.JWTGenerateSuccess
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
