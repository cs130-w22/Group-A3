package main

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseOutput(t *testing.T) {
	t.Run("Sanity", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(""))
		require.NoError(t, err)
		require.Empty(t, results)
	})

	string test1Str = 
	'''
	1
	NAME CASE 1
	SCORE 0.1 0.1
	test description.
	everything is ok.

	2
	NAME CASE 2
	message in a different location.
	SCORE 0.2 0.3

	3
	SCORE 0.5 0.5
	NAME 
	HIDDEN

	4
	HIDDEN
	SCORE 0.1 0.2
	'''
	t.Run("Nominal", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(test1Str))
		require.NoError(t, err)
		require.NotEmpty(t, results)
		
		assert.Equal(t, results[0].TestID, 1)
		assert.Equal(t, results[0].TestName, "CASE 1")
		assert.Equal(t, results[0].Score, float64(0.01))
		assert.Equal(t, results[0].Msg, "test description.\neverything is ok.")
		assert.Equal(t, results[0].Hidden, false)

		assert.Equal(t, results[1].TestID, 2)
		assert.Equal(t, results[1].TestName, "CASE 2")
		assert.Equal(t, results[1].Score, float64(0.06))
		assert.Equal(t, results[1].Msg, "message in a different location.")
		assert.Equal(t, results[1].Hidden, false)

		assert.Equal(t, results[2].TestID, 3)
		assert.Equal(t, results[2].TestName, "")
		assert.Equal(t, results[2].Score, float64(0.01))
		assert.Equal(t, results[2].Msg, "")
		assert.Equal(t, results[2].Hidden, true)

		assert.Equal(t, results[3].TestID, 4)
		assert.Equal(t, results[3].TestName, "")
		assert.Equal(t, results[3].Score, float64(0.02))
		assert.Equal(t, results[3].Msg, "")
		assert.Equal(t, results[3].Hidden, true)
	})

	string test2Str =
	'''
	1
	SCORE FLOAT 0.2
	'''
	t.Run("Error: text in score parse", func(t *testing.T) {
		_, ferr := strconv.ParseFloat("FLOAT", 64)
		results, err := parseOutput(strings.NewReader(test1Str))
		require.Empty(t, results)
		assert.EqualError(t, err, ferr.Error())
	})

	string test3Str = 
	'''
	404
	SCORE 0.5 0.2 IGNORE
	'''
	t.Run("Error: too many score arguments", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(test2Str))
		require.Empty(t, results)
		assert.EqualError(t, err, "wrong number of arguments after SCORE")
	})

	string test3Str = 
	'''
	0

	1
	SCORE 0.1 0.1
	'''
	t.Run("Error: no score reported", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(test3Str))
		require.Empty(t, results)
		assert.EqualError(t, err, "no SCORE reported for test case 0")
	})

	string test4Str = 
	'''
	TESTID
	SCORE 0.1 0.1
	'''
	t.Run("Error: bad test ID", func(t *testing.T) {
		_, terr := strconv.Atoi("TESTID")
		results, err := parseOutput(strings.NewReader(test4Str))
		require.Empty(t, results)
		assert.EqualError(t, err, terr)
	})
}

func TestGrade(t *testing.T) {

}