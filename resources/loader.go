package resources

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"path"
	"path/filepath"
	"strings"
)

type Loader interface {
	Open(fname string) ([]byte, error)
	Prefix() string
}

type fileLoader struct {
	basedir string
}

func (f *fileLoader) Open(fname string) ([]byte, error) {
	return ioutil.ReadFile(filepath.Join(f.basedir, fname))
}
func (f *fileLoader) Prefix() string {
	return filepath.Base(f.basedir)
}

func NewFileLoader(dir string) Loader {
	return &cacheLoader{
		l:     &fileLoader{basedir: dir},
		cache: map[string][]byte{},
	}
}

type httpLoader struct {
	baseAddr string
}

func (h *httpLoader) Open(fname string) ([]byte, error) {
	fullURL := h.baseAddr + "/" + fname
	//fmt.Println(fullURL)
	resp, err := http.Get(fullURL)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Not found")
	}
	defer resp.Body.Close()
	return ioutil.ReadAll(resp.Body)
}
func (h *httpLoader) Prefix() string {
	return path.Base(h.baseAddr)
}

func NewHttpLoader(url string) Loader {
	return &cacheLoader{
		l:     &httpLoader{baseAddr: url},
		cache: map[string][]byte{},
	}
}

type cacheLoader struct {
	l     Loader
	cache map[string][]byte
}

func (c *cacheLoader) Open(fname string) ([]byte, error) {
	if c.cache[fname] != nil {
		return c.cache[fname], nil
	}
	// try all case combinations since files seem pretty inconsistent in practice
	// TODO: remove duplicates
	toTry := []string{
		fname,
		strings.ToUpper(fname),
		strings.ToLower(fname),
	}
	var d []byte
	var err error
	for _, n := range toTry {
		d, err = c.l.Open(n)
		if err == nil {
			c.cache[fname] = d
			break
		}
	}
	return d, err
}
func (c *cacheLoader) Prefix() string {
	return c.l.Prefix()
}
