package monitoring

import (
	"github.com/getsentry/sentry-go"
	"log"
)

func InitSentry() {
	if err := sentry.Init(sentry.ClientOptions{
		Dsn:              "https://64863974fc40c460b43567a528de514f@o4509246334369792.ingest.us.sentry.io/4509251928522752",
		EnableTracing:    true,
		TracesSampleRate: 1.0,
	}); err != nil {
		log.Fatal(err)
	}
}
