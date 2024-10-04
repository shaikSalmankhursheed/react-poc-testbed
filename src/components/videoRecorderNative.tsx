/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

const VideoRecorderNative: React.FC = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleVideoUpload = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        if (video.duration > 10) {
          setErrorMessage("Video exceeds the 10-second limit.");
          setVideoFile(null);
        } else {
          setErrorMessage("");
          setVideoFile(file);
        }
      };
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "5rem" }}>
        Record Video, Works on mobile only, On desktop it will be a file picker
      </h1>
      <input
        type="file"
        accept="video/*"
        capture="user"
        onChange={handleVideoUpload}
      />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {videoFile && <p>Video recorded successfully!</p>}
    </div>
  );
};

export default VideoRecorderNative;
