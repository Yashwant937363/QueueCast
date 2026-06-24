export interface Song {
  id: string;
  url: string;
  name: string;
  picture: string;
  likes: number;
  source: "youtube" | "jiosaavn";
  isLiked: boolean;
}
