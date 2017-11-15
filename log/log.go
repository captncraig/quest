package log

import (
	l "log"
)

func Warnf(msg string, args ...interface{}) {
	l.Printf("WARN: "+msg, args...)
}
