package structs

import "time"

type User struct {
	ID        string    `json:"id" db:"id"`
	Auth0Id   string    `json:"auth0Id" db:"auth0Id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Picture   *string   `json:"picture,omitempty" db:"picture"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}
