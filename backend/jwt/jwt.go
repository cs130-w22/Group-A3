// Clean wrapper around the community-maintained `jwt` package.
package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Package-local secret key used in all `jwt` transactions.
// If left nil, will cause `jwt` function calls to panic!
var pkgSecretKey []byte

// Set the secret key used by the `jwt` package.
func UseKey(secretKey []byte) {
	pkgSecretKey = secretKey
}

// Description of claims made by our JWT.
type Claims struct {
	UserID uint `json:"id"`
	jwt.RegisteredClaims
}

// Create and encode `Claims` with provided information and sane
// defaults.
func EncodeClaims(userId uint) (string, error) {
	claims := &Claims{
		UserID: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 30)),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	t, err := token.SignedString(pkgSecretKey)
	if err != nil {
		return "", err
	}
	return t, nil
}

// Parse `Claims` from a base64-encoded token.
func ParseClaims(b64token string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(b64token, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return pkgSecretKey, nil
	})
	if err != nil {
		return nil, err
	}
	return token.Claims.(*Claims), nil
}
