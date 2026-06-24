import type { Song } from "./Song";

export interface MasterTime {
  currentTime: number;
  date: number;
  duration: number;
}

export interface NowPlaying {
  song: Song;
  masterTime: MasterTime;
}
