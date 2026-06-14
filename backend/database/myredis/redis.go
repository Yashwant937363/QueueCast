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

func PublishJSON(ctx context.Context, channel string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return RDB.Publish(ctx, channel, data).Err()
}
