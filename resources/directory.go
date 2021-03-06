package resources

import (
	"encoding/binary"
	"fmt"
	"strings"

	"github.com/captncraig/quest/log"
	"github.com/captncraig/quest/logic"
)

type IndexEntry struct {
	VolNum    byte
	Offset    uint32
	RawData   []byte // only populated if fully loaded
	LoadError error
	Data      interface{}
}

type Directory struct {
	AgiVersion     byte
	LongAgiVersion string
	Logics         []*IndexEntry
	Pictures       []*IndexEntry
	Views          []*IndexEntry
	Sounds         []*IndexEntry
	Words          map[string]uint16
	WordGroups     map[uint16][]string
	l              Loader
}

func LoadGameInfo(l Loader) (*Directory, error) {
	dir := &Directory{l: l}
	dir.AgiVersion, dir.LongAgiVersion = readVersionFromAgiDataOvl(l)
	if dir.AgiVersion == 0 {
		// if picdir is found, assume v2
		if _, err := l.Open("picdir"); err == nil {
			dir.AgiVersion = 2
		} else {
			dir.AgiVersion = 3
		}
	}
	if dir.AgiVersion == 2 {
		if err := dir.LoadV2(); err != nil {
			return nil, err
		}
	} else if dir.AgiVersion == 3 {
		if err := dir.LoadV3(); err != nil {
			return nil, err
		}
	} else {
		return nil, fmt.Errorf("Unknown AGI version %d (%s detected)", dir.AgiVersion, dir.LongAgiVersion)
	}
	if err := dir.loadWords(); err != nil {
		return nil, err
	}
	return dir, nil
}

func (d *Directory) LoadAllResources() error {
	var load = func(idx []*IndexEntry, f func([]byte) (interface{}, error)) {
		for i, entry := range idx {
			if entry == nil {
				continue
			}
			vol, err := d.loadVolume(entry.VolNum)
			if err != nil {
				entry.LoadError = err
				continue
			}
			//TODO: V3 Uses LZW and a 7 byte header
			if len(vol) < int(entry.Offset+5) {
				entry.LoadError = fmt.Errorf("Invalid Offset. Volume too short")
				continue
			}
			vol = vol[entry.Offset:]
			sig := binary.BigEndian.Uint16(vol)
			if sig != 0x1234 {
				entry.LoadError = fmt.Errorf("Incorrect signature at offset")
				continue
			}
			size := binary.LittleEndian.Uint16(vol[3:])
			vol = vol[5:]
			vol = vol[:size]
			entry.RawData = vol
			if f != nil {
				fmt.Println("!!!!!!!", i)
				entry.Data, err = f(vol)
				if err != nil {
					entry.LoadError = err
					continue
				}
			}
		}
	}
	load(d.Logics, logic.New)
	load(d.Pictures, nil)
	load(d.Views, nil)
	load(d.Sounds, nil)
	return nil
}

func (d *Directory) loadVolume(n byte) ([]byte, error) {
	if d.AgiVersion == 3 {
		return d.l.Open(fmt.Sprintf("%sVOL.%d", d.l.Prefix(), n))
	}
	return d.l.Open(fmt.Sprintf("VOL.%d", n))
}

func (d *Directory) LoadV2() error {
	var err error
	if d.Logics, err = d.loadv2Index("LOGDIR"); err != nil {
		return err
	}
	if d.Pictures, err = d.loadv2Index("PICDIR"); err != nil {
		return err
	}
	if d.Views, err = d.loadv2Index("VIEWDIR"); err != nil {
		return err
	}
	if d.Sounds, err = d.loadv2Index("SNDDIR"); err != nil {
		return err
	}
	return nil
}

func (d *Directory) loadv2Index(name string) ([]*IndexEntry, error) {
	dat, err := d.l.Open(name)
	if err != nil {
		return nil, err
	}
	return parseIndexEntries(dat, name)
}

func parseIndexEntries(dat []byte, name string) ([]*IndexEntry, error) {
	if len(dat) == 0 || len(dat)%3 != 0 {
		return nil, fmt.Errorf("%s should be a multiple of three bytes long. Got %d", name, len(dat))
	}
	idx := make([]*IndexEntry, 256)
	for num := 0; num < len(dat)/3; num++ {
		i := num * 3
		offset := uint32(dat[i])<<16 | uint32(dat[i+1])<<8 | uint32(dat[i+2])
		if offset == 0xffffff {
			continue
		}
		idx[num] = &IndexEntry{
			VolNum: byte(offset >> 20),
			Offset: offset & 0x0fffff,
		}
	}
	return idx, nil
}

func (d *Directory) LoadV3() error {
	fname := d.l.Prefix() + "DIR"
	dat, err := d.l.Open(fname)
	if err != nil {
		return err
	}
	if len(dat) < 8 {
		return fmt.Errorf("%s should be at least 8 bytes long. Got %d", fname, len(dat))
	}
	sndOff := binary.LittleEndian.Uint16(dat[6:])
	viewOff := binary.LittleEndian.Uint16(dat[4:])
	picOff := binary.LittleEndian.Uint16(dat[2:])
	logOff := binary.LittleEndian.Uint16(dat)
	// load backwards so we just trim off the tail each time
	if d.Sounds, err = parseIndexEntries(dat[sndOff:], fname+"(SND)"); err != nil {
		return err
	}
	dat = dat[:sndOff]
	if d.Views, err = parseIndexEntries(dat[viewOff:], fname+"(VIEW)"); err != nil {
		return err
	}
	dat = dat[:viewOff]
	if d.Pictures, err = parseIndexEntries(dat[picOff:], fname+"(PIC)"); err != nil {
		return err
	}
	dat = dat[:picOff]
	if d.Logics, err = parseIndexEntries(dat[logOff:], fname+"(LOG)"); err != nil {
		return err
	}
	return nil
}

func readVersionFromAgiDataOvl(l Loader) (byte, string) {
	agidata, err := l.Open("agidata.ovl")
	const unknown = "?"
	if err != nil {
		log.Warnf("Couldn't load agidata.ovl: %s", err)
		return 0, unknown
	}
	if idx := strings.Index(string(agidata), "Version "); idx != -1 {
		vString := string(agidata)[idx+8:]
		if idx = strings.IndexByte(vString, 0); idx != -1 {
			vString = vString[:idx]
			return (vString[0] - '0'), vString
		}
	}
	log.Warnf("Couldn't determine version from agidata.ovl: %s", err)
	return 0, unknown
}

func (d *Directory) loadWords() error {
	dat, err := d.l.Open("WORDS.TOK")
	if err != nil {
		return err
	}
	d.Words = map[string]uint16{}
	d.WordGroups = map[uint16][]string{}
	dat = dat[52:]
	word := []byte{}
	for len(dat) > 4 {
		keep := dat[0]
		word = word[:keep]
		dat = dat[1:]
		for {
			ch := dat[0]
			dat = dat[1:]
			if ch == 0 {
				break
			}
			word = append(word, (ch^0x7F)&0x7F)
			if ch&0x80 != 0 {
				break
			}
		}
		i, w := binary.BigEndian.Uint16(dat), string(word)
		d.Words[w] = i
		d.WordGroups[i] = append(d.WordGroups[i], w)
		dat = dat[2:]
	}
	return nil
}
