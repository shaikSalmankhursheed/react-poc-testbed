/* eslint-disable formatjs/no-literal-string-in-jsx */
import React, { useRef, useState, useEffect } from "react";

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60); // Countdown starts at 60 seconds

  useEffect(() => {
    // Request access to the webcam and specifically the back camera
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { exact: "environment" } },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing the back camera: ", error);
      });
  }, []);

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
