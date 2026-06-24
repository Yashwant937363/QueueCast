package structs

type SongSource string

const (
	SourceYouTube  SongSource = "youtube"
	SourceJioSaavn SongSource = "jiosaavn"
)

type Song struct {
	Id      string     `json:"id"`
	Url     string     `json:"url"`
	Name    string     `json:"name"`
	Picture string     `json:"picture"`
	Source  SongSource `json:"source"`
	Likes   int32      `json:"likes"`
	IsLiked bool       `json:"isLiked,omitempty"`
}
