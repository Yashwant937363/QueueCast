export interface Song {
  id: string;
  title: string;
  artist: string;
  image: string;
  votes: number;
  source: "youtube" | "jiosaavn";
}

export interface QueueSong extends Song {
  position: number;
}
