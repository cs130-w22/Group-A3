package main

import (
    "fmt"
    "strings"
	"strconv"
	"os"
)

func main() {
	test_str := "1, Doxa, ston, Theo, gia, ola, ta, pragmata"
	fmt.Println(strings.Split(test_str, ",")[0:])

	argnum := 0
	if len(os.Args) > 1 {
		argnum, _ = strconv.Atoi(os.Args[1])
		_, err := strconv.Atoi(os.Args[1])
		if err != nil {
			print(err)
			return
		}
	}

	if a := argnum; a == 100 {
		fmt.Println("2 Definition worked")
	} else {
		fmt.Println("2 Definition failed")
	}

	text := "NAME"
	if text[4:] == "" {
		fmt.Println("3 Empty")
	}
} 