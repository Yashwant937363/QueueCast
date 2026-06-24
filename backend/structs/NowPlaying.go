package structs

type MasterTime struct {
	CurrentTime float32 `json:"currentTime"`
	Date        int     `json:"date"`
	Duration    float32 `json:"duration"`
}

type NowPlaying struct {
	Song       Song       `json:"song"`
	MasterTime MasterTime `json:"masterTime"`
	Playing    bool       `json:"playing"`
}
