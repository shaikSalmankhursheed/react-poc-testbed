/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

const VideoRecorderNativeTest: React.FC = () => {
  const [videoFile, setVideoFile] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoSize, setVideoSize] = useState<number | null>(null);

  const handleVideoUpload = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        // if (video.duration > 60) {
        //   setErrorMessage("Video exceeds the 10-second limit.");
        //   setVideoFile(null);
        // } else {
        setErrorMessage("");
        setVideoFile(file);
        setVideoDuration(video.duration); // Set the duration
        setVideoSize(file.size / (1024 * 1024)); // Convert bytes to MB
        // }
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
      {videoFile && (
        <div>
          <p>Video recorded successfully!</p>
          <video
            controls
            width="320"
            height="240"
            src={URL.createObjectURL(videoFile)}
          ></video>
          <p>Duration: {videoDuration?.toFixed(2)} seconds</p>
          <p>Size: {videoSize?.toFixed(2)} MB</p>
        </div>
      )}
    </div>
  );
};

export default VideoRecorderNativeTest;
