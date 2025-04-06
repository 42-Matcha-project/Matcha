package utils

import (
	"github.com/gin-gonic/gin"
	"log"
	"os"
	"time"
)

func ProductionLogger() gin.HandlerFunc {
	logger := log.New(os.Stdout, "[production] ", log.LstdFlags)
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Printf("%s | %s | %d | %s | %s",
			start.Format("2006/01/02 15:04:05"),
			c.Request.Method,
			c.Writer.Status(),
			c.Request.URL.Path,
			time.Since(start))
	}
}
