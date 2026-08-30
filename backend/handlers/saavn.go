package handlers

import (
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const ListenfreeBaseURL = "https://backend.listenfree.in/api"

// ProxySaavn proxies music API requests to https://backend.listenfree.in/api
func ProxySaavn(c *gin.Context) {
	subPath := c.Param("path")

	// If subPath starts with "/api/", remove "/api" prefix because ListenfreeBaseURL already contains "/api"
	if strings.HasPrefix(subPath, "/api/") {
		subPath = strings.TrimPrefix(subPath, "/api")
	} else if subPath == "/api" {
		subPath = ""
	}

	if !strings.HasPrefix(subPath, "/") && subPath != "" {
		subPath = "/" + subPath
	}

	targetURL := ListenfreeBaseURL + subPath
	if c.Request.URL.RawQuery != "" {
		targetURL += "?" + c.Request.URL.RawQuery
	}

	req, err := http.NewRequestWithContext(c.Request.Context(), c.Request.Method, targetURL, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		return
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch from Listenfree API", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return
	}

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/json"
	}

	c.Data(resp.StatusCode, contentType, bodyBytes)
}
