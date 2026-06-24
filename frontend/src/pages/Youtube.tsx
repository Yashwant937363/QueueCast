import { useState, useEffect, useRef } from "react";
import YouTubePlayer from "youtube-player";

interface Video {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

function Youtube() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchVideos = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
          query,
        )}&key=${apiKey}`,
      );

      const data = await response.json();

      setVideos(data.items || []);

      if (data.items?.length > 0) {
        setSelectedVideo(data.items[0].id.videoId);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <h1>YouTube Search Player</h1>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          style={{
            flex: 1,
            padding: 10,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchVideos();
            }
          }}
        />

        <button onClick={searchVideos}>Search</button>
      </div>

      {loading && <p>Searching...</p>}

      {selectedVideo && <MusicPlayer videoId={selectedVideo} />}

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gap: 12,
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            onClick={() => setSelectedVideo(video.id.videoId)}
            style={{
              display: "flex",
              gap: 12,
              cursor: "pointer",
              border: "1px solid #ddd",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              width={180}
            />

            <div>
              <h3>{video.snippet.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MusicPlayer({ videoId }: { videoId: string }) {
  const playerRef = useRef<any>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!videoId) return;

    if (!playerRef.current) {
      playerRef.current = YouTubePlayer("youtube-player");
    }

    playerRef.current.loadVideoById(videoId);

    const interval = setInterval(async () => {
      if (playerRef.current) {
        const current = await playerRef.current.getCurrentTime();
        const total = await playerRef.current.getDuration();

        setCurrentTime(current);
        setDuration(total);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoId]);

  const play = () => playerRef.current?.playVideo();

  const pause = () => playerRef.current?.pauseVideo();

  const forward = async () => {
    const time = await playerRef.current.getCurrentTime();
    playerRef.current.seekTo(time + 10, true);
  };

  const backward = async () => {
    const time = await playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(time - 10, 0), true);
  };

  const seek = (value: number) => {
    playerRef.current.seekTo(value, true);
  };

  return (
    <>
      {/* Hidden Player */}
      <div
        id="youtube-player"
        style={{
          width: 1,
          height: 1,
          overflow: "hidden",
          position: "absolute",
        }}
      />

      <div
        style={{
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 10,
        }}
      >
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ width: "100%" }}
        />

        <p>
          {Math.floor(currentTime)} / {Math.floor(duration)} sec
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={backward}>⏪ 10s</button>
          <button onClick={play}>▶️</button>
          <button onClick={pause}>⏸️</button>
          <button onClick={forward}>⏩ 10s</button>
        </div>
      </div>
    </>
  );
}

export default Youtube;
