/* eslint-disable formatjs/no-literal-string-in-jsx */
import React, { useRef, useState, useEffect } from "react";

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60); // Countdown starts at 60 seconds
  const [usingBackCamera, setUsingBackCamera] = useState<boolean>(false); // Toggle between front and back cameras

  const startCamera = async (facingMode: "user" | "environment") => {
    if (streamRef.current) {
      // Stop the current stream before switching cameras
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } },
      });

      // Store the new stream
      streamRef.current = stream;

      // Assign the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera: ", error);

      // Fallback to the front camera if the back camera is not available
      if (facingMode === "environment") {
        startCamera("user");
      }
    }
  };

  useEffect(() => {
    // Start with the front camera by default
    startCamera("user");

    // Clean up the stream when the component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    // Toggle between front and back cameras
    const newFacingMode = usingBackCamera ? "user" : "environment";
    setUsingBackCamera(!usingBackCamera);
    startCamera(newFacingMode);
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      setRecording(true);
      setCountdown(6); // Reset countdown to 60 seconds

      // Get the stream from the video element
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      // Store the media recorder instance
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available (video chunks)
      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunks.push(e.data);
      };

      // When the recording stops, create a blob from the video chunks
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const videoURL = URL.createObjectURL(blob);
        setVideoURL(videoURL);
      };

      // Start recording
      mediaRecorder.start();

      // Countdown logic
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearInterval(countdownInterval);
            mediaRecorder.stop();
            setRecording(false);
            return 0;
          }
        });
      }, 1000); // Decrease countdown every second

      // Stop recording automatically after 1 minute (60,000 ms)
      setTimeout(() => {
        mediaRecorder.stop();
        setRecording(false);
        clearInterval(countdownInterval);
      }, 6000); // 60 seconds
    }
  };

  const stopRecording = () => {
    // Manually stop recording if needed
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "300px", height: "200px" }}
      />
      <br />
      <button onClick={toggleCamera}>
        Switch to {usingBackCamera ? "Front" : "Back"} Camera
      </button>
      <br />
      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
      <br />
      {recording && <h3>Time Remaining: {countdown} seconds</h3>}
      {videoURL && (
        <div>
          <h3>Recorded Video:</h3>
          <video
            src={videoURL}
            controls
            style={{ width: "300px", height: "200px" }}
          />
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
