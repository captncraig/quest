package logic

import (
	"fmt"
	"log"
	"strings"
)

type Stmt interface {
	base() *stmt
}
type Condition interface{}

type stmt struct {
	Addr int
	Raw  []byte
}

func (s *stmt) base() *stmt {
	return s
}

type ifStmt struct {
	*stmt
	JumpOffset uint16
	Condition  Condition
	Then       []Stmt
	Else       []Stmt
}
type opStmt struct {
	*stmt
	op   opCode
	args []byte
}
type gotoStmt struct {
	*stmt
	Offset uint16
}
type dispenser struct {
	b   []byte
	idx int
}

func (d *dispenser) take() byte {
	d.idx++
	return d.b[d.idx-1]
}
func (d *dispenser) peek() byte {
	return d.b[d.idx]
}
func (d *dispenser) has() bool {
	return d.idx < len(d.b)
}

func parse(raw []byte) ([]Stmt, error) {
	d := &dispenser{b: raw}
	s := []Stmt{}
	for d.has() {
		st, err := parseStmt(d)
		if err != nil {
			return nil, err
		}
		s = append(s, st)
	}
	return s, nil
}
func parseStmt(d *dispenser) (s Stmt, err error) {
	addr := d.idx
	defer func() {
		if err != nil {
			return
		}
		b := s.base()
		b.Addr = addr
		ln := d.idx - b.Addr
		b.Raw = d.b[addr : ln+addr]
		//fmt.Println(s.base(), ln)
		fmt.Println(s.base().Addr, printStmt(s), s.base().Raw)
		// TODO: fix up
	}()
	op := d.take()
	switch op {
	case 0xff:
		return parseIf(d)
	case 0xfe:
		return &gotoStmt{
			stmt:   &stmt{},
			Offset: uint16(d.take()) | uint16(d.take())<<8,
		}, nil
	default:
		if opc, ok := stmtOpCodes[op]; ok {
			ost := &opStmt{op: opc, stmt: &stmt{}}
			for i := 0; i < len(opc.Args); i++ {
				ost.args = append(ost.args, d.take())
			}
			return ost, nil
		}
		return nil, fmt.Errorf("Unknown Stmt Opcode %x", op)
	}
}
func parseIf(d *dispenser) (Stmt, error) {
	is := &ifStmt{stmt: &stmt{}}
	var err error
	is.Condition, err = parseCondition(d)
	if err != nil {
		return nil, err
	}
	is.JumpOffset = uint16(d.take()) | uint16(d.take())<<8
	return is, nil
}

type conditionalOp struct {
	op   opCode
	args []byte
}
type andCondition []Condition
type orCondition []Condition
type notCondition struct {
	other Condition
}

func parseCondition(d *dispenser) (Condition, error) {
	ops := []Condition{}
	for {
		c, err := parseSingleCondition(d)
		if err != nil {
			return nil, err
		}
		if c == nil {
			break
		}
		ops = append(ops, c)
	}
	if len(ops) == 1 {
		return ops[0], nil
	}
	return andCondition(ops), nil
}
func parseSingleCondition(d *dispenser) (Condition, error) {
	op := d.take()
	if op == 0xff {
		return nil, nil
	}
	switch op {
	case 0xfc:
		ors := orCondition{}
		for {
			if d.peek() == 0xfc {
				d.take()
				break
			}
			next, err := parseSingleCondition(d)
			if err != nil {
				return nil, err
			}
			ors = append(ors, next)
		}
		return ors, nil
	case 0xfd:
		next, err := parseSingleCondition(d)
		if err != nil {
			return nil, err
		}
		return &notCondition{other: next}, nil
	default:
		if opc, ok := conditionalOpCodes[op]; ok {
			co := conditionalOp{op: opc}
			for i := 0; i < len(opc.Args); i++ {
				co.args = append(co.args, d.take())
			}
			if opc.Name == "said" {
				for i := 0; i < int(co.args[0])*2; i++ {
					co.args = append(co.args, d.take())
				}
			}
			return opc, nil
		}
		return nil, fmt.Errorf("Unknown Condition Opcode %x", op)
	}
}
func printStmt(s Stmt) string {

	switch t := s.(type) {
	case *opStmt:
		args := []string{}
		for _, b := range t.args {
			args = append(args, fmt.Sprint(b))
		}
		return fmt.Sprintf("%s(%s)", t.op.Name, strings.Join(args, ","))
	case *ifStmt:
		return "if(???)"
	case *gotoStmt:
		return fmt.Sprintf("goto %x", int16(t.Offset))
	default:
		log.Fatalf("printstmt unknown %T", s)
	}
	return "???"
}
