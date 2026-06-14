package structs

type ClientJoinReq struct {
	RoomId string   `json:"roomId"`
	Client RoomUser `json:"client"`
}

type ClientJoinRes struct {
	Client RoomUser `json:"client"`
}
type ClientLeftReq struct {
	RoomId  string `json:"roomId"`
	Auth0Id string `json:"auth0Id"`
}

type ClientLeftRes struct {
	Auth0Id string `json:"auth0Id"`
}
