package database

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

var RDB *redis.Client

func ConnectRedis() error {
	RDB = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URL"),
	})
	pong, err := RDB.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Could not connect to Redis: %v", err)
		return err
	}
	fmt.Printf("Connected successfully to Redis! Ping response: %s\n", pong)
	return nil
}
