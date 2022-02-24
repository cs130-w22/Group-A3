package grading

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path"
	"strings"
)

// Channels are opened, fed objects from some other file.
func Grade(job Job, jobQueue <-chan bool) {
	defer func() { <-jobQueue }()
	results := job.Results

	// job.file will be hosted locally, somewhere.
	// Not going to worry about it here.
	zr, err := gzip.NewReader(job.File)
	if err != nil {
		return
	}
	defer zr.Close()
	tr := tar.NewReader(zr)

	// Stick to bigmoney pattern for creating the temp assignment directory.
	dirPfx := "./run"
	dir := path.Join(dirPfx, dirPfx+"-"+strings.ReplaceAll(job.ID, "-", ""))
	if err := os.MkdirAll(dir, 0640); err != nil {
		panic(err)
	}
	defer os.RemoveAll(dir)

	for header, err := tr.Next(); err == nil; header, err = tr.Next() {
		tmpFile, err := os.Create(path.Join(dir, header.Name))
		if err != nil {
			fmt.Println(err)
		}
		if err := os.Chmod(tmpFile.Name(), 0640); err != nil {
			fmt.Println(err)
		}
		if _, err := io.Copy(tmpFile, tr); err != nil {
			fmt.Println(err)
		}
	}

	// Execute grading script driver.
	cmd := exec.Command(job.Script, dir)
	output, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println(err)
		return
	}
	if err := cmd.Start(); err != nil {
		fmt.Println(err)
		return
	}

	// Parse the output of running the driver.
	parsed, err := parseOutput(output)
	if err != nil {
		fmt.Println(err)
		return
	}
	for _, result := range parsed {
		results <- result
	}
	if err := cmd.Wait(); err != nil {
		fmt.Println(err)
		return
	}
}
