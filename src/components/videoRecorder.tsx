/* eslint-disable formatjs/no-literal-string-in-jsx */
import React, { useRef, useState, useEffect } from "react";
import { Modal, Box, Button, IconButton, Typography } from "@mui/material";
// import CameraIcon from "@mui/icons-material/PhotoCamera";

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10); // Countdown starts at 60 seconds
  const [usingBackCamera, setUsingBackCamera] = useState<boolean>(false); // Toggle between front and back cameras
  const [open, setOpen] = useState<boolean>(false); // Modal open state

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
      setCountdown(10); // Reset countdown to 60 seconds

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

  const handleOpen = () => {
    setOpen(true);
    // Start with the front camera by default
    startCamera("user");
  };

  const handleClose = () => {
    setOpen(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>
        Open Camera
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90vw",
            height: "90vh",
            bgcolor: "black",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            outline: "none",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ width: "100%", height: "auto", maxHeight: "80%" }}
          />
          {recording && (
            <Typography sx={{ color: "white", position: "absolute", top: 10 }}>
              Time Remaining: {countdown} seconds
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              bottom: 20,
            }}
          >
            <IconButton
              onClick={!recording ? startRecording : stopRecording}
              sx={{
                bgcolor: "white",
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "5px solid red",
              }}
            >
              <div style={{ fontSize: 40, color: recording ? "red" : "black" }}>
                camera icon
              </div>
              {/* <CameraIcon
                sx={{ fontSize: 40, color: recording ? "red" : "black" }}
              /> */}
            </IconButton>
          </Box>
          <Button
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "white",
            }}
            onClick={toggleCamera}
          >
            Switch to {usingBackCamera ? "Front" : "Back"} Camera
          </Button>
        </Box>
      </Modal>

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
