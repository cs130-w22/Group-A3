package grading

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseOutput(t *testing.T) {
	t.Run("BasicOutput", func(t *testing.T) {
		results, err := parseOutput(strings.NewReader(`001
HIDDEN
NAME Test Name hi
Some extra text
SCORE 0.1 100`))
		assert.NoError(t, err)
		assert.NotEmpty(t, results)
		assert.Len(t, results, 1)
		assert.Equal(t, float64(10), results[0].Score)
	})
}
