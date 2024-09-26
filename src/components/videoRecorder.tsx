import React, { useRef, useState, useEffect } from "react";
import { Modal, Box, Button, IconButton, Typography } from "@mui/material";

const VideoRecorder: React.FC = () => {
  const countDownInSeconds = 60 * 5;
  const timerValueInMs = 60000;
  const ticking = 1000 / 5;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const [recording, setRecording] = useState<boolean>(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(countDownInSeconds);
  const [usingBackCamera, setUsingBackCamera] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const startCamera = async (facingMode: "user" | "environment") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera: ", error);

      if (facingMode === "environment") {
        startCamera("user");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      clearCountdownInterval(); // Clear countdown when component unmounts
    };
  }, []);

  const toggleCamera = () => {
    const newFacingMode = usingBackCamera ? "user" : "environment";
    setUsingBackCamera(!usingBackCamera);
    startCamera(newFacingMode);
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      setRecording(true);
      setCountdown(countDownInSeconds);

      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const videoURL = URL.createObjectURL(blob);
        setVideoURL(videoURL);
      };

      mediaRecorder.start();

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearCountdownInterval();
            mediaRecorder.stop();
            setRecording(false);
            return 0;
          }
        });
      }, ticking);

      timeoutRef.current = setTimeout(() => {
        mediaRecorder.stop();
        setRecording(false);
        clearCountdownInterval();
        setTimeout(() => {
          setOpen(false);
        }, 150);
      }, timerValueInMs);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      clearCountdownInterval();
      clearTimeout(timeoutRef.current!);

      setTimeout(() => {
        setOpen(false);
      }, 300);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    startCamera("user");
  };

  const handleClose = () => {
    setOpen(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    clearCountdownInterval();
  };

  const clearCountdownInterval = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const progressPercentage = (countdown / countDownInSeconds) * 100;

  console.log(progressPercentage, "lol"); // This should stop after recording stops

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
            width: "80vw",
            height: "80vh",
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
            style={{ width: "90%", maxHeight: "100%" }}
          />
          {recording && (
            <Typography sx={{ color: "white", position: "absolute", top: 10 }}>
              Time Remaining: {Math.ceil(countdown / 5)} seconds
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
                position: "relative",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `conic-gradient(red ${progressPercentage}%, white ${progressPercentage}% 100%)`,
                border: "none",
              }}
            >
              <div
                style={{ fontSize: 40, color: recording ? "red" : "black" }}
              ></div>
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
            Switch Camera
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
