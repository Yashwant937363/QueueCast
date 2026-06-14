package postgres

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool

func ConnectDB() error {
	var err error
	enverr := godotenv.Load()
	if enverr != nil {
		fmt.Println("error while loading env file")
	}

	connString := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	DB, err = pgxpool.New(context.Background(), connString)
	if err != nil {
		return err
	}

	err = DB.Ping(context.Background())
	if err != nil {
		return err
	}

	fmt.Println("Connected to PostgreSQL")
	return nil
}
