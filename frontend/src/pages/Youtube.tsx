import { useState } from "react";

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

      {selectedVideo && (
        <div style={{ marginTop: 20 }}>
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${selectedVideo}`}
            title="YouTube player"
            allowFullScreen
          />
        </div>
      )}

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

export default Youtube;
