package applogs

import (
	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
	"os"
)

func RespondJSON(reqContext *gin.Context, httpStatus int, err error, responseCode int, JSONResponse gin.H) {
	reqContext.JSON(httpStatus, JSONResponse)

	if httpStatus >= 400 {
		if os.Getenv("ENVIRONMENT") == "production" {
			sentryHub := sentrygin.GetHubFromContext(reqContext)
			if sentryHub != nil {
				sentryHub.WithScope(func(scope *sentry.Scope) {
					if responseCode >= 100 {
						scope.SetLevel(sentry.LevelWarning)
					} else if responseCode >= 200 {
						scope.SetLevel(sentry.LevelError)
					} else if responseCode >= 300 {
						scope.SetLevel(sentry.LevelFatal)
					} else {
						scope.SetLevel(sentry.LevelInfo)
					}
					scope.SetTag("endpoint", reqContext.FullPath())
					scope.SetTag("method", reqContext.Request.Method)

					scope.SetExtra("request_headers", reqContext.Request.Header)
					scope.SetExtra("response_headers", responseCode)
					sentryHub.CaptureException(err)
				})
			}
		}
		reqContext.Error(err)
	}

	reqContext.Abort()
}
