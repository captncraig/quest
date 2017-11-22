package logic

type ArgType byte

const (
	TVar = iota
	TFlag
	TIObj
	TSObj
	TNum
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
	0x05: op("greatern", TVar, TNum),
}

var stmtOpCodes = map[byte]opCode{
	0x16: op("call", TNum),
}
