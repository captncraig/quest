package main

import (
	"fmt"
	"log"

	"github.com/captncraig/quest/resources"
)

func main() {
	l := resources.NewHttpLoader(`https://captncraig.github.io/quest/games/kq1`)
	dir, err := resources.LoadGameInfo(l)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(dir.LongAgiVersion, dir.AgiVersion)
	dir.LoadAllResources()
}
