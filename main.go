package main

import (
	"fmt"
	"log"

	"github.com/captncraig/quest/resources"
)

func main() {
	l := resources.NewFileLoader(`https://nyc3.digitaloceanspaces.com/agi/kq1`)
	dir, err := resources.LoadGameInfo(l)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(dir.LongAgiVersion, dir.AgiVersion)
}
