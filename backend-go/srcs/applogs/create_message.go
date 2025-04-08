package applogs

import (
	"github.com/gin-gonic/gin"
)

type ResponseOptions struct {
	OTP   string
	Token string
}

func CreateJSONResponseByResponseCode(responseCode int, options ResponseOptions) gin.H {
	JSONResponse := gin.H{
		"ResponseCode": responseCode,
		"Message":      Message[responseCode],
	}

	if options.OTP != "" {
		JSONResponse["OTP"] = options.OTP
	}
	if options.Token != "" {
		JSONResponse["Token"] = options.Token
	}
	return JSONResponse
}
