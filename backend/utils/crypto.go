package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
	"strings"
)

// Default secret key (32 bytes for AES-256)
var secretKey = []byte("QueueCastRoomSecretKey32BytesLong!")

// EncryptPassword encrypts a plaintext password into a URL-safe hex string prefixed with "enc:"
func EncryptPassword(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	block, err := aes.NewCipher(secretKey[:32])
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return "enc:" + hex.EncodeToString(ciphertext), nil
}

// DecryptPassword decrypts a hex string (prefixed with "enc:") back to the original plaintext password
func DecryptPassword(token string) (string, error) {
	if !strings.HasPrefix(token, "enc:") {
		return token, nil // If not encrypted, return raw token
	}

	rawHex := strings.TrimPrefix(token, "enc:")
	ciphertext, err := hex.DecodeString(rawHex)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(secretKey[:32])
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, actualCiphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, actualCiphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}
