package postgres

import (
	"context"

	"github.com/Yashwant937363/QueueCast/backend/structs"
)

func CreateUser(user structs.User) (*structs.User, error) {
	var createdUser structs.User

	err := DB.QueryRow(
		context.Background(),
		`INSERT INTO users(username, email, picture, auth0_id)
		 VALUES($1,$2,$3,$4)
		 RETURNING id, username, email, picture, created_at`,
		user.Username,
		user.Email,
		user.Picture,
		user.Auth0Id,
	).Scan(
		&createdUser.ID,
		&createdUser.Username,
		&createdUser.Email,
		&createdUser.Picture,
		&createdUser.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &createdUser, nil
}

func CheckForUser(email string) (bool, error) {
	var exists bool

	err := DB.QueryRow(
		context.Background(),
		`SELECT EXISTS(
			SELECT 1
			FROM users
			WHERE email = $1
		)`,
		email,
	).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}
