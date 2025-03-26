import React, { useState } from "react";
import YouTube from "react-youtube";
import "./YouTubePlayer.css";

const YouTubePlayer = ({ onClose }) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState(null);

  // Extract YouTube Video ID from URL
  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]+)/,
    );
    return match ? match[1] : null;
  };

  // Handle Play Video Button Click
  const handlePlayVideo = () => {
    const id = extractVideoId(youtubeUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert("❌ Invalid YouTube URL. Please enter a valid link.");
    }
  };

  // Handle Replay Video
  const handleReplay = () => {
    setVideoId(null);
  };

  return (
    <div className="youtube-container">
      {videoId ? (
        // Video Player - Centered and Enhanced
        <div className="youtube-video-box">
          <YouTube
            videoId={videoId}
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                modestbranding: 1,
                rel: 0,
                autoplay: 1,
              },
            }}
            className="w-full h-full"
          />
          {/* Action Buttons */}
          <div className="youtube-btn-group">
            <button onClick={handleReplay} className="youtube-btn">
              🔄 Replay
            </button>
            <button onClick={onClose} className="youtube-btn youtube-btn-back">
              ↩ Back
            </button>
          </div>
        </div>
      ) : (
        // URL Input Mode
        <div className="youtube-url-box">
          <h2 className="youtube-heading">🎥 Study from YouTube</h2>

          {/* URL Input */}
          <input
            type="text"
            placeholder="📎 Paste YouTube URL here..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="youtube-input"
          />

          {/* Play Button */}
          <button onClick={handlePlayVideo} className="youtube-btn">
            ▶ Play Video
          </button>

          {/* Back Button */}
          <button onClick={onClose} className="youtube-btn youtube-btn-back">
            ↩ Back
          </button>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
