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

type SongAddedReq struct {
	RoomId string `json:"roomId"`
	Song   Song   `json:"song"`
}

type LikeSongReq struct {
	Likes  int64  `json:"likes"`
	SongId string `json:"songId"`
	RoomId string `json:"roomId"`
}

type LikeSongRes struct {
	Likes  int64  `json:"likes"`
	SongId string `json:"songId"`
}

type NewRoomReq struct {
	Room Room `json:"room"`
}

type NewRoomRes struct {
	Room Room `json:"room"`
}

type UpdatePlayingStateReq struct {
	RoomId  string `json:"roomId"`
	Playing bool   `json:"playing"`
}

type NextSongReq struct {
	Song   Song   `json:"song"`
	RoomId string `json:"roomId"`
}
