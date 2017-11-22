package logic

type ArgType byte

const (
	TVar = iota
	TFlag
	TIObj
	TSObj
	TNum
	TMsg
	TString
	TCtl
)

type opCode struct {
	Name string
	Args []ArgType
}

func op(name string, args ...ArgType) opCode {
	return opCode{Name: name, Args: args}
}

var conditionalOpCodes = map[byte]opCode{
	0x01: op("equaln", TVar, TNum),
	0x02: op("equalv", TVar, TVar),
	0x03: op("lessn", TVar, TNum),
	0x05: op("greatern", TVar, TNum),
	0x07: op("isset", TFlag),
	0x0c: op("controller", TCtl),
	0x0e: op("said", TNum),
	//0x11: op("center.posn", TSObj, TNum, TNum, TNum, TNum),
}

var stmtOpCodes = map[byte]opCode{
	0x00: op("return"),
	0x01: op("increment", TVar),
	0x03: op("assignn", TVar, TNum),
	0x04: op("assignv", TVar, TVar),
	0x05: op("addn", TVar, TNum),
	0x0b: op("lindirectv", TVar, TVar),
	0x0c: op("set", TFlag),
	0x0d: op("reset", TFlag),
	0x0e: op("toggle", TFlag),
	0x10: op("reset.v", TVar),
	0x12: op("new.room", TNum),
	0x14: op("load.logics", TNum),
	0x15: op("load.logics.v", TVar),
	0x16: op("call", TNum),
	0x1e: op("load.view", TNum),
	0x1f: op("load.view.v", TVar),
	0x21: op("animate.obj", TSObj),
	0x27: op("get.posn", TSObj, TVar, TVar),
	0x29: op("set.view", TSObj, TNum),
	0x2a: op("set.view.v", TSObj, TVar),
	0x2f: op("set.cel", TSObj, TNum),
	0x44: op("observe.objs", TSObj),
	0x46: op("stop.cycling", TSObj),
	0x47: op("start.cycling", TSObj),
	0x49: op("end.of.loop", TSObj, TFlag),
	0x4c: op("cycle.time", TSObj, TVar),
	0x4d: op("stop.motion", TSObj),
	0x4e: op("start.motion", TSObj),
	0x59: op("observe.blocks", TSObj),
	0x5e: op("drop", TIObj),
	0x62: op("load.sound", TNum),
	0x64: op("stop.sound"),
	0x65: op("print", TMsg),
	0x6c: op("set.cursor.char", TMsg),
	0x6f: op("configure.screen", TNum, TNum, TNum),
	0x72: op("set.string", TString, TMsg),
	0x7c: op("status"),
	0x7d: op("save.game"),
	0x7e: op("restore.game"),
	0x80: op("restart.game"),
	0x81: op("show.obj", TNum),
	0x83: op("program.control"),
	0x86: op("quit", TNum),
	0x88: op("pause"),
	0x89: op("echo.line"),
	0x8a: op("cancel.line"),
	0x8b: op("init.joy"),
	0x8c: op("toggle.monitor"),
	0x8d: op("version"),
	0x8e: op("script.size", TNum),
	0x8f: op("set.game.id", TMsg),
	0x9c: op("set.menu", TMsg),
	0x9d: op("set.menu.item", TMsg, TCtl),
	0x9e: op("submit.menu"),
	0xa0: op("disable.item", TCtl),
	0xa1: op("menu.input"),
	0xa2: op("show.obj.v", TVar),
}
