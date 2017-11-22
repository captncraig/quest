package logic

import (
	"encoding/binary"
)

type Logic struct {
	Messages     map[byte]string
	Instructions []byte
	Stmts        []Stmt
}

func New(raw []byte) (interface{}, error) {
	l := &Logic{}
	textStart := binary.LittleEndian.Uint16(raw) + 2
	l.Messages = decodeMessages(raw[textStart:])
	l.Instructions = raw[2:textStart]
	stmts, err := parse(l.Instructions)
	if err != nil {
		return nil, err
	}
	l.Stmts = stmts
	return l, nil
}

func decodeMessages(d []byte) map[byte]string {
	n := int(d[0])
	offsets := make([]int, n)
	for i := range offsets {
		offsets[i] = int(binary.LittleEndian.Uint16(d[3+2*i:]))
	}
	d = d[3+2*n:]
	key := "Avis Durgan"
	// decode all
	for i := range d {
		d[i] ^= key[i%len(key)]
	}
	m := map[byte]string{}
	for i, off := range offsets {
		if off == 0 {
			continue
		}
		off -= (2 + 2*n)
		str := ""
		for j := off; j < len(d); j++ {
			c := d[j]
			if c == 0 {
				break
			}
			str += string(c)
		}
		m[byte(i)] = str
	}
	return m
}
