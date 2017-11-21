package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"

	"github.com/gopherjs/gopherjs/js"
	"github.com/gopherjs/jquery"

	"github.com/captncraig/quest/resources"
)

func main() {
	go fetchGamesList()
}

func fetchGamesList() {
	resp, err := http.Get("https://api.github.com/repos/captncraig/quest/contents/docs/games")
	if err != nil {
		alert(err)
		return
	}
	defer resp.Body.Close()
	j := json.NewDecoder(resp.Body)
	dat := []struct {
		Name string `json:"name"`
	}{}
	if err = j.Decode(&dat); err != nil {
		alert(err)
		return
	}

	renderContent(gameList, dat)
	jq(".gameLink").On(jquery.CLICK, func(e jquery.Event) {
		go loadGame(jq(e.Target).Attr("id"))
	})
}

var jq = jquery.NewJQuery

func renderContent(tpl *template.Template, ctx interface{}) {
	renderContentTo(tpl, ctx, "#content")
}

func renderContentTo(tpl *template.Template, ctx interface{}, selector string) {
	buf := &bytes.Buffer{}
	tpl.Execute(buf, ctx)
	jq(selector).SetHtml(buf.String())
}

func alert(err error) {
	js.Global.Get("Noty").New(map[string]string{"text": err.Error(), "type": "error"}).Call("show")
}

var loader resources.Loader
var directory *resources.Directory
var gameID string
var counts = map[string]int{}

func loadGame(id string) {
	renderContent(loading, "game data for "+id)
	gameID = id
	loader = resources.NewHttpLoader("https://captncraig.github.io/quest/games/" + id)
	var err error
	directory, err = resources.LoadGameInfo(loader)
	if err != nil {
		alert(err)
	}
	counts = map[string]int{}
	for _, p := range directory.Logics {
		if p != nil {
			counts["logics"]++
		}
	}
	for _, p := range directory.Pictures {
		if p != nil {
			counts["pictures"]++
		}
	}
	for _, p := range directory.Views {
		if p != nil {
			counts["views"]++
		}
	}
	for _, p := range directory.Sounds {
		if p != nil {
			counts["sounds"]++
		}
	}
	counts["words"] = len(directory.Words)
	renderContent(directoryTpl, map[string]interface{}{
		"dir":    directory,
		"game":   gameID,
		"counts": counts,
	})
	jq(".sub-loader").On(jquery.CLICK, func(e jquery.Event) {
		el := jq(e.Target).Attr("id")
		var tpl *template.Template
		var ctx interface{}
		switch el {
		case "map":
			tpl, ctx = resourceMap, directory
		case "words":
			tpl, ctx = words, map[string]interface{}{"words": directory.Words, "groups": directory.WordGroups}
		default:
			alert(fmt.Errorf("Loading %s not implemented yet", el))
			return
		}
		renderContentTo(tpl, ctx, "#innerContent")
	})
}

var directoryTpl = tpl(`
	<div class='row'>
		<h2>{{.game}}</h2>
	</div>
	<div class='row'>
		<label>Interpreter Version:</label> <b>{{.dir.LongAgiVersion}}</b> <label>Agi Version:</label> <b>{{.dir.AgiVersion}}</b>
	</div>
	<div class='row'>
		<button class='btn btn-default sub-loader' id='map'>Resource Map</button>
		<button class='btn btn-default sub-loader' id='logics'>{{.counts.logics}} Logics</button>
		<button class='btn btn-default sub-loader' id='pics'>{{.counts.pictures}} Pictures</button>
		<button class='btn btn-default sub-loader' id='views'>{{.counts.views}} Views</button>
		<button class='btn btn-default sub-loader' id='sounds'>{{.counts.sounds}} Sounds</button>
		<button class='btn btn-default sub-loader' id='words'>{{.counts.words}} Words</button>
	</div>
	<div id='innerContent' class='row'></div>
	`)
var resourceMap = tpl(`
	<table class='table table-bordered table-striped'>
		<thead>
		<th>ID</th>
		<th>logic</th>
		<th>picture</th>
		<th>view</th>
		<th>sound</th>
		</thead>
		<tbody>
			{{$d := .}}
			{{range $i,$l := .Logics}}
				<tr>
					{{$p := index $d.Pictures $i}}
					{{$v := index $d.Views $i}}
					{{$s := index $d.Sounds $i}}
					<td>{{$i}}</td>
					<td>{{if $l}}Vol{{$l.VolNum}} @{{hex $l.Offset}}{{else}}-{{end}}</td>
					<td>{{if $p}}Vol{{$p.VolNum}} @{{hex $p.Offset}}{{else}}-{{end}}</td>
					<td>{{if $v}}Vol{{$v.VolNum}} @{{hex $v.Offset}}{{else}}-{{end}}</td>
					<td>{{if $s}}Vol{{$s.VolNum}} @{{hex $s.Offset}}{{else}}-{{end}}</td>
				</tr>
			{{end}}
		</tbody>
	</table>`)
var words = tpl(`
	<div class='col-md-6'>
	<h3>All words</h3>
	<ul>
		{{range $w,$i := .words}}
			<li>{{$w}}- {{$i}}</li>
		{{end}}
	</ul>
	</div>
	<div class='col-md-6'>
	<h3>Word Groups</h3>
	<ul>
		{{range $i,$w := .groups}}
			<li>{{$i}}</li>
			<ul>
				{{range $w}}
					<li>{{.}}</li>
				{{end}}
			</ul>
		{{end}}
	</ul>
	</div>
`)
var loading = tpl(`<div class='row'>Loading {{.}}...</div>`)
var gameList = tpl(`<div class='row'><h2>Pick a Game</h2></div><div class='row'><ul>{{range .}}<li><a href="#" class='gameLink' id='{{.Name}}'>{{.Name}}</a></li>{{end}}</ul></div>`)

var funcMap = template.FuncMap{
	"hex": func(value interface{}) string {
		return fmt.Sprintf("0x%x", value)
	},
}

func tpl(s string) *template.Template {
	return template.Must(template.New("").Funcs(funcMap).Parse(s))
}
