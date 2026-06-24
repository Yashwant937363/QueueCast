export interface JioSaavnSong {
  id: string;
  name: string;
  image: {
    quality: string;
    url: string;
  }[];
  downloadUrl: {
    quality: string;
    url: string;
  }[];
  primaryArtists: string;
}
