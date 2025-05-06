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
			applogs.RespondJSON(reqContext, http.StatusUnauthorized, err, applogs.InvalidJSONInput, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJSONInput, applogs.ResponseOptions{}))
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
			applogs.RespondJSON(reqContext, http.StatusUnauthorized, err, applogs.InvalidJWTToken, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJWTToken, applogs.ResponseOptions{}))
			reqContext.Abort()
			return
		}

		userId, err := token.ExtractUserIdFromRequest(reqContext)
		if err != nil {
			applogs.RespondJSON(reqContext, http.StatusUnauthorized, err, applogs.InvalidJWTToken, applogs.CreateJSONResponseByResponseCode(applogs.InvalidJWTToken, applogs.ResponseOptions{}))
			reqContext.Abort()
			return
		}

		if userId != 1 {
			applogs.RespondJSON(reqContext, http.StatusUnauthorized, err, applogs.NotHaveAdministratorPrivileges, applogs.CreateJSONResponseByResponseCode(applogs.NotHaveAdministratorPrivileges, applogs.ResponseOptions{}))
			reqContext.Abort()
			return
		}

		reqContext.Next()
	}
}
