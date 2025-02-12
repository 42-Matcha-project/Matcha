package token

import (
	"os"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
)

func GenerateJWTToken(id uint) (string, error) {
	/*
		JWTトークンを生成する関数。
		ペイロードにidとlifespanを含む。
		秘密鍵で署名して返す。
	*/
	tokenLifeSpan, err := strconv.Atoi(os.Getenv("JWT_TOKEN_LIFE_SPAN"))
	if err != nil {
		return "", err
	}

	claims := jwt.MapClaims{}
	claims["authorized"] = true
	claims["user_id"] = id
	timeZone := os.Getenv("TIME_ZONE")
	location, err := time.LoadLocation(timeZone)
	claims["exp"] = time.Now().In(location).Add(time.Hour * time.Duration(tokenLifeSpan)).Unix()

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return jwtToken.SignedString([]byte(os.Getenv("JWT_SECRET_KEY")))
}
