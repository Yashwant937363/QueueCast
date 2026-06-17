package handlers

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Yashwant937363/QueueCast/backend/database/myredis"
	"github.com/Yashwant937363/QueueCast/backend/database/postgres"
	"github.com/Yashwant937363/QueueCast/backend/middleware"
	"github.com/Yashwant937363/QueueCast/backend/structs"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type LoginRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Picture  string `json:"picture"`
}

func LoginUser(c *gin.Context) {

	type LoginCache struct {
		Auth0Id string `json:"auth0Id"`
		Exists  bool   `json:"exists"`
	}

	val, geterr := myredis.RDB.Get(ctx, "logincache:"+c.GetHeader("Authorization")).Bytes()
	if geterr == redis.Nil {
		fmt.Println("key does not exist")
	} else if geterr != nil {
		fmt.Println(geterr)
	} else {
		var cacheData LoginCache

		err := json.Unmarshal(val, &cacheData)
		if err == nil {
			c.JSON(200, gin.H{
				"message": "success",
				"auth0Id": cacheData.Auth0Id,
			})
			return
		}
	}

	auth0ID, autherr := middleware.GetAuth0ID(c.GetHeader("Authorization"))

	if autherr != nil {
		c.JSON(400, gin.H{
			"error": autherr.Error(),
		})
		return
	}
	var body LoginRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	fmt.Println(
		"Auth0 ID: ", auth0ID,
	)

	exists, err := postgres.CheckForUser(body.Email)
	if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	if !exists && body.Email != "" {

		_, createErr := postgres.CreateUser(structs.User{
			Email: body.Email, Username: body.Username, Picture: &body.Picture, Auth0Id: auth0ID,
		})
		if createErr != nil {
			c.JSON(500, gin.H{
				"error": createErr.Error(),
			})
		}
	}

	cache := LoginCache{
		Auth0Id: auth0ID,
		Exists:  exists,
	}

	data, _ := json.Marshal(cache)

	myredis.RDB.Set(ctx, "logincache:"+c.GetHeader("Authorization"), data, 30*time.Second)

	c.JSON(200, gin.H{
		"message": "success",
		"auth0Id": auth0ID,
	})
}
