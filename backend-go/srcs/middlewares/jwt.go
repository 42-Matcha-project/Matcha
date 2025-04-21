package middlewares

import (
	"net/http"
	"srcs/applogs"
	"srcs/token"

	"github.com/gin-gonic/gin"
)

func JWTValidationMiddleware() gin.HandlerFunc {
	/*
		JWTトークンの認証を行うmiddleware関数。
		認証に失敗した場合、リクエストを中断しエラーを返す。
		成功した場合、リクエストを続行する。
	*/
	return func(reqContext *gin.Context) {
		err := token.ValidateJWTToken(reqContext)
		if err != nil {
			reqContext.JSON(http.StatusUnauthorized, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJWTToken, applogs.ResponseOptions{}))
			reqContext.Error(err)
			reqContext.Abort()
			return
		}

		reqContext.Next()
	}
}

func AdminJWTValidationMiddleware() gin.HandlerFunc {
	/*
		JWTトークンの認証を行うmiddleware関数。
		認証に失敗した場合、リクエストを中断しエラーを返す。
		成功した場合、リクエストを続行する。
	*/
	return func(reqContext *gin.Context) {
		err := token.ValidateJWTToken(reqContext)
		if err != nil {
			reqContext.JSON(http.StatusUnauthorized, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJWTToken, applogs.ResponseOptions{}))
			reqContext.Error(err)
			reqContext.Abort()
			return
		}

		userId, err := token.ExtractUserIdFromRequest(reqContext)
		if err != nil {
			reqContext.JSON(http.StatusUnauthorized, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJWTToken, applogs.ResponseOptions{}))
			reqContext.Error(err)
			reqContext.Abort()
			return
		}

		if userId != 1 {
			reqContext.JSON(http.StatusUnauthorized, applogs.CreateJSONResponseByResponseCode(applogs.NotHaveAdministratorPrivileges, applogs.ResponseOptions{}))
			reqContext.Error(err)
			reqContext.Abort()
			return
		}

		reqContext.Next()
	}
}
