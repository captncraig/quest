package logic

import "fmt"

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
		fmt.Println(s.base(), ln)
		// TODO: fix up
	}()
	fmt.Println("@@PStmt", addr)
	op := d.take()
	switch op {
	case 0xff:
		return parseIf(d)
	default:
		if opc, ok := stmtOpCodes[op]; ok {
			ost := opStmt{op: opc, stmt: &stmt{}}
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
	is.JumpOffset = uint16(d.take())<<8 | uint16(d.take())
	return is, nil
}

type conditionalOp struct {
	op   opCode
	args []byte
}
type andCondition []Condition

func parseCondition(d *dispenser) (Condition, error) {
	ops := []Condition{}
	for {
		op := d.take()
		if op == 0xff {
			break
		}
		switch op {
		default:
			if opc, ok := conditionalOpCodes[op]; ok {
				co := conditionalOp{op: opc}
				for i := 0; i < len(opc.Args); i++ {
					co.args = append(co.args, d.take())
				}
				ops = append(ops, opc)
			} else {
				return nil, fmt.Errorf("Unknown Condition Opcode %x", op)
			}
		}
	}
	if len(ops) == 1 {
		return ops[0], nil
	}
	return andCondition(ops), nil
}
