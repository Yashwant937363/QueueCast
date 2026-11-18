package myredis

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

var RDB *redis.Client

func ConnectRedis() error {
	redisURL := os.Getenv("REDIS_URL")

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return fmt.Errorf("invalid Redis URL: %w", err)
	}

	RDB = redis.NewClient(opt)

	pong, err := RDB.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Could not connect to Redis: %v\n", err)
		return err
	}

	fmt.Printf("Connected successfully to Redis! Ping response: %s\n", pong)

	return nil
}

func PublishJSON(ctx context.Context, channel string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return RDB.Publish(ctx, channel, data).Err()
}
