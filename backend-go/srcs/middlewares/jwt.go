package middlewares

import (
	"net/http"
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
			reqContext.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			reqContext.Abort()
			return
		}

		reqContext.Next()
	}
}
