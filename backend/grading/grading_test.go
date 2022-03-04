package grading

import (
	"strings"
	"strconv"
	"testing"
	"math"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseOutput2(t *testing.T) {
	t.Run("Sanity", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(""))
		require.NoError(t, err)
		require.Empty(t, results)
	})
	
	test1Str := 
	"1\nNAME CASE 1\nSCORE 0.1 0.1\ntest description.\neverything is ok.\n\n" +
	"2\nNAME CASE 2\nmessage in a different location.\nSCORE 0.2 0.3\n\n" +
	"3\nSCORE 0.5 0.5\nNAME\nHIDDEN\n\n" +
	"4\nHIDDEN\nSCORE 0.1 0.2"
	t.Run("Nominal", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(test1Str))
		require.NoError(t, err)
		require.NotEmpty(t, results)
		
		assert.Equal(t, results[0].TestID, 1)
		assert.Equal(t, results[0].TestName, "CASE 1")
		assert.True(t, math.Abs(results[0].Score) - 0.01 < 0.001)
		assert.Equal(t, results[0].Msg, "test description.\neverything is ok.")
		assert.Equal(t, results[0].Hidden, false)

		assert.Equal(t, results[1].TestID, 2)
		assert.Equal(t, results[1].TestName, "CASE 2")
		assert.True(t, math.Abs(results[1].Score) - 0.06 < 0.001)
		assert.Equal(t, results[1].Msg, "message in a different location.")
		assert.Equal(t, results[1].Hidden, false)

		assert.Equal(t, results[2].TestID, 3)
		assert.Equal(t, results[2].TestName, "")
		assert.True(t, math.Abs(results[2].Score) - 0.25 < 0.001)
		assert.Equal(t, results[2].Msg, "")
		assert.Equal(t, results[2].Hidden, true)

		assert.Equal(t, results[3].TestID, 4)
		assert.Equal(t, results[3].TestName, "")
		assert.True(t, math.Abs(results[3].Score) - 0.02 < 0.001)
		assert.Equal(t, results[3].Msg, "")
		assert.Equal(t, results[3].Hidden, true)
	})

	test2Str := "1\nSCORE FLOAT 0.2"
	t.Run("Error: text in score parse", func(t *testing.T) {
		_, ferr := strconv.ParseFloat("FLOAT", 64)
		results, err := parseOutput(strings.NewReader(test2Str))
		require.Empty(t, results)
		assert.EqualError(t, err, ferr.Error())
	})
	
	test3Str := "404\nSCORE 0.5 0.2 IGNORE"
	t.Run("Error: too many score arguments", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(test3Str))
		require.Empty(t, results)
		assert.EqualError(t, err, "wrong number of arguments after SCORE")
	})
	
	test4Str := "0\n\n1\nSCORE 0.1 0.1"
	t.Run("Error: no score reported", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(test4Str))
		require.Empty(t, results)
		assert.EqualError(t, err, "no SCORE reported for test case 0")
	})
	
	test5Str := "TESTID\nSCORE 0.1 0.1"
	t.Run("Error: bad test ID", func(t *testing.T) {
		_, terr := strconv.Atoi("TESTID")
		results, err := parseOutput(strings.NewReader(test5Str))
		require.Empty(t, results)
		assert.EqualError(t, err, terr.Error())
	})
}