package logic

import (
	"fmt"
)

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
	0x06: op("greaterv", TVar, TVar),
	0x07: op("isset", TFlag),
	0x08: op("issetv", TVar),
	0x0b: op("posn", TSObj, TNum, TNum, TNum, TNum),
	0x0c: op("controller", TCtl),
	0x0d: op("have.key"),
	0x0e: op("said", TNum),
}

var stmtOpCodes = map[byte]opCode{
	0x00: op("return"),
	0x01: op("increment", TVar),
	0x02: op("decrement", TVar),
	0x03: op("assignn", TVar, TNum),
	0x04: op("assignv", TVar, TVar),
	0x05: op("addn", TVar, TNum),
	//0x06: op(""),
	0x07: op("subn", TVar, TNum),
	0x08: op("subv", TVar, TVar),
	0x09: op("lindirectv", TVar, TNum),
	0x0a: op("rindirect", TVar, TVar),
	0x0b: op("lindirectv", TVar, TVar),
	0x0c: op("set", TFlag),
	0x0d: op("reset", TFlag),
	0x0e: op("toggle", TFlag),
	0x0f: op("set.v", TVar),
	0x10: op("reset.v", TVar),
	//0x11: op(""),
	0x12: op("new.room", TNum),
	0x13: op("new.room.v", TVar),
	0x14: op("load.logics", TNum),
	0x15: op("load.logics.v", TVar),
	0x16: op("call", TNum),
	0x17: op("call.v", TVar),
	0x18: op("load.pic", TVar),
	0x19: op("draw.pic", TVar),
	0x1a: op("show.pic"),
	0x1b: op("discard.pic", TVar),
	0x1c: op("overlay.pic", TVar),
	0x1d: op("show.pri.screen"),
	0x1e: op("load.view", TNum),
	0x1f: op("load.view.v", TVar),
	0x20: op("discard.view", TNum),
	0x21: op("animate.obj", TSObj),
	//0x22: op(""),
	0x23: op("draw", TSObj),
	0x24: op("erase", TSObj),
	0x25: op("position", TSObj, TVar, TVar),
	0x26: op("position.v", TSObj, TVar, TVar),
	0x27: op("get.posn", TSObj, TVar, TVar),
	0x28: op("reposition", TSObj, TVar, TVar),
	0x29: op("set.view", TSObj, TNum),
	0x2a: op("set.view.v", TSObj, TVar),
	0x2b: op("set.loop", TSObj, TNum),
	//0x2c: op(""),
	//0x2d: op(""),
	//0x2e: op(""),
	0x2f: op("set.cel", TSObj, TNum),
	//0x30: op(""),
	//0x31: op(""),
	//0x32: op(""),
	0x33: op("current.loop", TSObj, TVar),
	//0x34: op(""),
	//0x35: op(""),
	0x36: op("set.priority", TSObj, TNum),
	0x37: op("set.priority.v", TSObj, TVar),
	0x38: op("release.priority", TSObj),
	0x39: op("get.priority", TSObj, TVar),
	0x3a: op("stop.update", TSObj),
	0x3b: op("start.update", TSObj),
	//0x3c: op(""),
	0x3d: op("ignore.horizon", TSObj),
	//0x3e: op(""),
	0x3f: op("set.horizon", TNum),
	0x40: op("object.on.water", TSObj),
	0x41: op("object.on.land", TSObj),
	//0x42: op(""),
	0x43: op("ignore.objs", TSObj),
	0x44: op("observe.objs", TSObj),
	0x45: op("distance", TSObj, TSObj, TVar),
	0x46: op("stop.cycling", TSObj),
	0x47: op("start.cycling", TSObj),
	0x48: op("normal.cycle", TSObj),
	0x49: op("end.of.loop", TSObj, TFlag),
	//0x4a: op(""),
	0x4b: op("reverse.loop", TSObj, TFlag),
	0x4c: op("cycle.time", TSObj, TVar),
	0x4d: op("stop.motion", TSObj),
	0x4e: op("start.motion", TSObj),
	0x4f: op("step.size", TSObj, TVar),
	//0x50: op(""),
	0x51: op("move.obj", TSObj, TNum, TNum, TNum, TFlag),
	0x52: op("move.obj.v", TSObj, TVar, TVar, TNum, TFlag),
	0x53: op("follow.ego", TSObj, TNum, TFlag),
	0x54: op("wander", TSObj),
	0x55: op("normal.motion", TSObj),
	0x56: op("set.dir", TSObj, TVar),
	//0x57: op(""),
	0x58: op("ignore.blocks", TSObj),
	0x59: op("observe.blocks", TSObj),
	0x5a: op("block", TNum, TNum, TNum, TNum),
	//0x5b: op(""),
	0x5c: op("get", TIObj),
	0x5d: op("get.v", TVar),
	0x5e: op("drop", TIObj),
	//0x5f: op(""),
	//0x60: op(""),
	//0x61: op(""),
	0x62: op("load.sound", TNum),
	0x63: op("sound", TNum, TFlag),
	0x64: op("stop.sound"),
	0x65: op("print", TMsg),
	0x66: op("print.v", TVar),
	0x67: op("display", TNum, TNum, TMsg),
	0x68: op("display.v", TVar, TVar, TMsg),
	0x69: op("clear.lines", TNum, TNum, TNum),
	0x6a: op("text.screen"),
	0x6b: op("graphics"),
	0x6c: op("set.cursor.char", TMsg),
	0x6d: op("set.text.attribute", TNum, TNum),
	0x6e: op("shake.screen", TNum),
	0x6f: op("configure.screen", TNum, TNum, TNum),
	0x70: op("status.line.on"),
	0x71: op("status.line.off"),
	0x72: op("set.string", TString, TMsg),
	//0x73: op(""),
	//0x74: op(""),
	//0x75: op(""),
	0x76: op("get.num", TMsg, TVar),
	0x77: op("prevent.input"),
	0x78: op("accept.input"),
	0x79: op("set.key", TNum, TNum, TCtl),
	0x7a: op("add.to.pic", TNum, TNum, TNum, TNum, TNum, TNum, TNum),
	//0x7b: op(""),
	0x7c: op("status"),
	0x7d: op("save.game"),
	0x7e: op("restore.game"),
	//0x7f: op(""),
	0x80: op("restart.game"),
	0x81: op("show.obj", TNum),
	0x82: op("random", TNum, TNum, TVar),
	0x83: op("program.control"),
	0x84: op("player.control"),
	0x85: op("obj.status.v", TVar),
	0x86: op("quit", TNum),
	0x87: op("show.mem"),
	0x88: op("pause"),
	0x89: op("echo.line"),
	0x8a: op("cancel.line"),
	0x8b: op("init.joy"),
	0x8c: op("toggle.monitor"),
	0x8d: op("version"),
	0x8e: op("script.size", TNum),
	0x8f: op("set.game.id", TMsg),
	0x90: op("log", TMsg),
	//0x91: op(""),
	//0x92: op(""),
	0x93: op("reposition.to", TSObj, TNum, TNum),
	//0x94: op(""),
	//0x95: op(""),
	//0x96: op(""),
	//0x97: op(""),
	//0x98: op(""),
	//0x99: op(""),
	//0x9a: op(""),
	//0x9b: op(""),
	0x9c: op("set.menu", TMsg),
	0x9d: op("set.menu.item", TMsg, TCtl),
	0x9e: op("submit.menu"),
	//0x9f: op(""),
	0xa0: op("disable.item", TCtl),
	0xa1: op("menu.input"),
	0xa2: op("show.obj.v", TVar),
}

var printers = map[string]func([]byte) string{
	"equaln": func(args []byte) string {
		return fmt.Sprintf("%s == %d", printArg(TVar, args[0]), args[1])
	},
	"greatern": func(args []byte) string {
		return fmt.Sprintf("%s > %d", printArg(TVar, args[0]), args[1])
	},
}

func printArg(t ArgType, v byte) string {
	if s := builtins[lookupKey{t, v}]; s != "" {
		return s
	}
	switch t {
	case TVar:
		return fmt.Sprintf("v%d", v)
	case TFlag:
		return fmt.Sprintf("f%d", v)
	default:
		return fmt.Sprint(v)
	}
}

type lookupKey struct {
	at  ArgType
	num byte
}

var builtins = map[lookupKey]string{
	{TVar, 0}:  "room_no",
	{TVar, 1}:  "prev_room",
	{TVar, 2}:  "ego_touched",
	{TVar, 3}:  "current_score",
	{TVar, 4}:  "num_touching_border",
	{TVar, 5}:  "border_touched",
	{TVar, 6}:  "ego_dir",
	{TVar, 7}:  "max_score",
	{TVar, 8}:  "free_mem",
	{TVar, 9}:  "not_found_word",
	{TVar, 10}: "cycle_delay",
	{TVar, 11}: "seconds",
	{TVar, 12}: "minutes",
	{TVar, 13}: "hours",
	{TVar, 14}: "days",
	{TVar, 15}: "joystick_sensitivity",
	{TVar, 16}: "ego_view",
	{TVar, 17}: "error_code",
	{TVar, 18}: "error_data",
	{TVar, 19}: "key_pressed",
	{TVar, 20}: "computer_type",
	{TVar, 21}: "reset_time",
	{TVar, 22}: "sound_type",
	{TVar, 23}: "sound_volume",
	{TVar, 24}: "max_input_len",
	{TVar, 25}: "item_selected",
	{TVar, 26}: "monitor_type",

	{TFlag, 0}:  "ego_in_water",
	{TFlag, 1}:  "ego_obscured",
	{TFlag, 2}:  "has_command",
	{TFlag, 3}:  "ego_signal",
	{TFlag, 4}:  "accept_input",
	{TFlag, 5}:  "new_room",
	{TFlag, 6}:  "restarting",
	{TFlag, 7}:  "block_script_buffer",
	{TFlag, 8}:  "joy_on",
	{TFlag, 9}:  "sound_on",
	{TFlag, 10}: "debugger_on",
	{TFlag, 11}: "first_logic_0",
	{TFlag, 12}: "restoring",
	{TFlag, 13}: "allow_status",
	{TFlag, 14}: "allow_menu",
	{TFlag, 15}: "output_mode",
}
