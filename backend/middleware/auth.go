package middleware

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v3/jwks"
	"github.com/auth0/go-jwt-middleware/v3/validator"
	"github.com/joho/godotenv"
)

func NewValidator() (*validator.Validator, error) {
	enverr := godotenv.Load()
	if enverr != nil {
		fmt.Println("error while loading env file")
	}
	issuerURL, err := url.Parse(os.Getenv("AUTH0_DOMAIN"))
	if err != nil {
		return nil, err
	}

	provider, err := jwks.NewCachingProvider(
		jwks.WithIssuerURL(issuerURL),
		jwks.WithCacheTTL(5*time.Minute),
	)
	if err != nil {
		return nil, err
	}

	return validator.New(
		validator.WithKeyFunc(provider.KeyFunc),
		validator.WithAlgorithm(validator.RS256),
		validator.WithIssuer(issuerURL.String()),
		validator.WithAudience(os.Getenv("AUTH0_IDENTIFIER")),
		validator.WithAllowedClockSkew(time.Minute),
	)
}

func GetAuth0ID(authHeader string) (string, error) {
	tokenString := strings.TrimPrefix(
		authHeader,
		"Bearer ",
	)
	jwtValidator, err := NewValidator()
	if err != nil {
		fmt.Println(err)
	}

	claims, err := jwtValidator.ValidateToken(
		context.Background(),
		tokenString,
	)

	if err != nil {
		return "", err
	}

	validatedClaims := claims.(*validator.ValidatedClaims)
	return validatedClaims.RegisteredClaims.Subject, nil
}
