package utils

import (
	"github.com/gin-gonic/gin"
	"log"
	"os"
	"time"
)

func ProductionLogger() gin.HandlerFunc {
	if err := os.MkdirAll("logs/gin", 0755); err != nil {
		log.Fatal("Error creating log directory.", err)
	}

	logFile, err := os.OpenFile("logs/gin/access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal("Can't open log file.", err)
	}
	logger := log.New(logFile, "[production] ", 11)
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
