package token

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
)

func GenerateJWTTokenString(id uint) (string, error) {
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

func extractJWTTokenStringFromRequest(reqContext *gin.Context) string {
	/*
		リクエストヘッダからJWTトークンを抽出する関数。
		`Bearer <JWTtoken>`の形式で含まれるので<JWTToken>を抽出する。
	*/
	bearerToken := reqContext.Request.Header.Get("Authorization")

	bearerTokenParts := strings.Split(bearerToken, " ")
	if len(bearerTokenParts) == 2 {
		return bearerTokenParts[1]
	}
	return ""
}

func parseJWTTokenString(JWTTokenString string) (*jwt.Token, error) {
	/*
		JWTトークンの文字列を解析する関数。
		暗号化メソッドと秘密鍵が一致することを確かめる。
		正しければJWTトークンとして解析した型で返す。
	*/
	JWTToken, err := jwt.Parse(JWTTokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET_KEY")), nil
	})

	if err != nil {
		return nil, err
	}

	return JWTToken, nil
}

func ValidateJWTToken(reqContext *gin.Context) error {
	/*
			JWTトークンの認証を行う関数。
		初め文字列としてのトークンを抽出したのち、jwt.Token構造体にparseして、認証する。
	*/
	JWTTokenString := extractJWTTokenStringFromRequest(reqContext)

	JWTToken, err := parseJWTTokenString(JWTTokenString)
	if err != nil {
		return err
	}
	if !JWTToken.Valid {
		return fmt.Errorf("Invalid token")
	}

	return nil
}

func ExtractUserIdFromRequest(reqContext *gin.Context) (uint, error) {
	/*
		リクエスト情報からユーザーのidを抽出する関数。
		リクエストに含まれるJWTトークンを解析してクレーム部分からユーザーidを抽出し返す。
	*/
	JWTTokenString := extractJWTTokenStringFromRequest(reqContext)
	JWTToken, err := parseJWTTokenString(JWTTokenString)
	if err != nil {
		return 0, err
	}

	claims, ok := JWTToken.Claims.(jwt.MapClaims)
	if ok && JWTToken.Valid {
		userId, isTypeAssertionOk := claims["user_id"].(float64)
		if !isTypeAssertionOk {
			return 0, errors.New("Type assertion for user_id failed")
		}
		fmt.Println(userId)
		return uint(userId), nil
	}
	return 0, errors.New("Invalid token")
}
