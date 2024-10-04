/* eslint-disable formatjs/no-literal-string-in-jsx */
import React, { useRef, useState, useEffect } from "react";
import CameraswitchIcon from "@mui/icons-material/Cameraswitch";
import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/system";

const VideoRecorderCustom: React.FC = () => {
  const countDownInSeconds = 60; // 60seconds
  const countDownInMinutes = `01:00`;

  const ticking = 1000; // Set the countdown tick interval

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]); // Use ref to store video chunks across pauses
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // const timeoutRef = useRef<any>(null);

  const [recording, setRecording] = useState<boolean>(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(countDownInSeconds);
  const [usingBackCamera, setUsingBackCamera] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false); // Track pause/resume state
  const [isPhotoMode, setIsPhotoMode] = useState<boolean>(false); // Toggle between video and photo mode
  const [photoURL, setPhotoURL] = useState<string | null>(null); // Store the captured photo

  const startCamera = async (facingMode: "user" | "environment") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } },
        audio: true, // Ensure audio is captured
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera: ", error);
      // alert("Error accessing the camera");

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
      setIsPaused(false);
      setCountdown(countDownInSeconds);

      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunksRef.current.push(e.data); // Store video chunks across sessions
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/mp4" });
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
            setTimeout(() => {
              handleClose();
            }, 150);
            return 0;
          }
        });
      }, ticking);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      clearCountdownInterval();
      // clearTimeout(timeoutRef.current!);

      setTimeout(() => {
        handleClose();
      }, 150);
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearCountdownInterval(); // Pause the countdown timer
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearCountdownInterval();
            mediaRecorderRef.current?.stop();
            setRecording(false);
            return 0;
          }
        });
      }, ticking); // Resume countdown timer
    }
  };

  const handleOpen = () => {
    setOpen(true);
    startCamera("user");
  };

  const handleClose = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    clearCountdownInterval();
    setOpen(false);
  };

  const clearCountdownInterval = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Handle taking a photo
  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setPhotoURL(dataUrl);
      }
    }
    handleClose();
  };

  const formatTime = (seconds: number, totalTime: number) => {
    const elapsedTime = totalTime - seconds; // Calculate elapsed time
    const minutes = Math.floor(elapsedTime / 60);
    const remainingSeconds = elapsedTime % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
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
            width: "100vw",
            height: "100dvh",
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
            style={{ width: "90%", maxHeight: "100%" }}
          />{" "}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              backgroundColor: "red",
              borderRadius: "24px",
              padding: "4px 16px",
              color: "white",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            {isPhotoMode ? (
              "Photo Mode"
            ) : recording ? (
              <>
                {formatTime(countdown, countDownInSeconds)}
                <span style={{ fontWeight: "300" }}>
                  {" "}
                  / {countDownInMinutes}
                </span>
              </>
            ) : (
              "Video Mode"
            )}
          </Box>{" "}
          <Box
            sx={{ position: "absolute", right: 10, top: 10, color: "white" }}
          >
            <CloseIcon sx={{ fontSize: 40 }} onClick={handleClose} />
          </Box>
          {/* Toggle between photo and video modes */}
          {!recording && (
            <Box
              sx={{
                position: "absolute",
                bottom: 120,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* Photo Mode Pill */}
                <Box
                  onClick={() => setIsPhotoMode(true)}
                  sx={{
                    backgroundColor: isPhotoMode ? "white" : "black",
                    color: isPhotoMode ? "black" : "white",
                    border: "1px solid white",
                    borderRadius: "50px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    minWidth: "80px", // Optional: to keep both pills equal in size
                  }}
                >
                  Photo
                </Box>

                {/* Video Mode Pill */}
                <Box
                  onClick={() => setIsPhotoMode(false)}
                  sx={{
                    backgroundColor: !isPhotoMode ? "white" : "black",
                    color: !isPhotoMode ? "black" : "white",
                    border: "1px solid white",
                    borderRadius: "50px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    minWidth: "80px", // Optional: to keep both pills equal in size
                  }}
                >
                  Video
                </Box>
              </Box>
            </Box>
          )}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!recording && (
              <Button
                sx={{
                  color: "white",
                  position: "absolute",
                  right: 20,
                }}
                onClick={toggleCamera}
              >
                <CameraswitchIcon
                  sx={{
                    fontSize: 40,
                  }}
                />
              </Button>
            )}

            {!recording && !isPhotoMode ? (
              <IconButton
                onClick={startRecording}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "white",
                  border: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    background: "white", // Ensure no change on hover
                  },
                }}
              >
                <Box
                  sx={{
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    backgroundColor: "red",
                  }}
                />
              </IconButton>
            ) : null}

            {/* Take a photo when in photo mode */}
            {isPhotoMode && (
              <IconButton
                onClick={takePhoto}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "white",
                  border: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    background: "white", // Ensure no change on hover
                  },
                }}
              />
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                backgroundColor: "#FFFFFF",
                borderRadius: "38px",
              }}
            >
              {recording && !isPaused && !isPhotoMode && (
                <IconButton
                  onClick={pauseRecording}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "white",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      background: "white", // Ensure no change on hover
                    },
                  }}
                >
                  <PauseIcon
                    sx={{
                      fontSize: 40,
                      color: "black",
                    }}
                  />
                </IconButton>
              )}
              {isPaused && (
                <IconButton
                  onClick={resumeRecording}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "white",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      background: "white", // Ensure no change on hover
                    },
                  }}
                >
                  {!isPaused ? (
                    <PauseIcon
                      color={"error"}
                      sx={{
                        fontSize: 45,
                        color: "red",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: "red",
                      }}
                    />
                  )}
                </IconButton>
              )}
              {recording && (
                <IconButton
                  onClick={stopRecording}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "white",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                      background: "white", // Ensure no change on hover
                    },
                  }}
                >
                  <StopIcon
                    sx={{
                      fontSize: 50,
                      color: "black",
                    }}
                  />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Display the captured photo */}
      {photoURL && (
        <Box sx={{ marginTop: "1rem" }}>
          <img
            src={photoURL}
            alt="Captured"
            style={{ width: "100%", maxWidth: "300px" }}
          />
        </Box>
      )}

      {videoURL && (
        <Box sx={{ marginTop: "1rem" }}>
          <video controls style={{ width: "100%", maxWidth: "300px" }}>
            <source src={videoURL} type="video/mp4" />
          </video>
        </Box>
      )}

      {/* <video width="300" controls>
        <source
          src={
            "https://s3.eu-west-1.amazonaws.com/documents.elements-dev.cdkapps.eu/TEAMBRAHMOS/B3-VWPOC/0235a530-3f6d-11ef-9d4f-53c4ab6f6b05/K%20N%20Abhishek-HDOR-2023-Journey.mp4?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEcaCWV1LXdlc3QtMSJGMEQCIBqnJRB%2BxPLo%2FOMDR0TuKJEzuIh0luE%2BAtfP25t%2FZ18GAiBgdbTTsh18hdb2EVbIR9l%2BCsfA7yQh1fqgh0B%2Bf4xxBiqaBAiQ%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAQaDDM0NTY5ODc5MDIxMyIMLLGjzpSj3Phh9bygKu4D5l5OUJDy%2BVUmRCSXQI8apZdqqrDwS8N22P0cCn%2BtNV2VHtxEkklzjLMnSns%2FB8VXjvSTpV4QDV%2BOwLexo88Jd20duGtrSFKuP1QJHFl5F56u%2FofsfZmIEwlgyQkDzI%2BU1mJY2NbcMkxhihIL6pZ0WnPuYs6o0wgHKWFxF1qcQfAR2XlLmfp0k0d5hsH%2F47mJg0q5ICaRi%2Bc3sgDFUA8xtnd%2FxZ3DyHh2zFB8LZ1iDafcvqG9Ai68w08hKACB1xmBHvwPsgi7InftpfQ8zsww7Wh6d9ut6ndMRaDL%2BAlPyuXzXeTNHi1gttRdBXPKy56rvyceRI8jh2HA3C4E4mNH%2B2ay3DfcOLjFYVwRH6wSyFsjEMIn2rwEDA7xEzGlSuGWF8JQVdzrZyy5aic9yknbscmt5WRkyM%2FbXFndE8rbvsmQiSkTnJ4ef0ol3uGuBN3h%2BM4RdbdJVP0v1JoMDp8WUVGqkL7iGFsVr0qr%2BtJ%2FIzVWoXWCVlrPRspfcje3IFtLQZHfXEM7OxDeO76YKQ7jb9ITyijRSUQ43snGQRZqsuPLXQ6abn5vyiDPU%2BsyNhLQKDIrTZYTjlC7lE6F6%2FlN5gfb4ryjSgg4OanXwB0m%2Bkf3D9jgsEzkhcQGIqmn2xT6KoNaVuBHH%2FZQRM06n%2FcwzJTwtwY6lQKTZqHzCW18ichsds8oKFjtIzCe1VjxYztAGUHP2BjXbOxRAWCx6ep3mpWFfix44oCGqzTBek2awZ%2FCfjAWGo7cdZMFeiYMzlmjR8BSBp5s9uE2%2BEJcwe1YXFEYU8mbRGi1Xg7kH3WK1RRRgP6ilUZal9d4VVNTFfgQEU%2FGxn%2FXBL50vm8pC6Ji8S%2Fa0yYDleZqHR9d2JNsAw8HrB8%2Bp61UDw%2BpfWkfAgBSi4Xni1fx%2Byb5LaTl8N0QcFnVjMZHC9kgQRYgBvlBJpGLdWlflEcXZX8StT4wewNyZ7eOx46cGdlenMak3lXs0PICrJVn%2BH61bjrDLI6jYTGP4epUyZsEPpuVgSBlM1QaAKzSWOX9jWCRm3pa&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241001T144539Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAVA7KA5NC3ZWK3FYB%2F20241001%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Signature=15996a9d32fc0e9c2e73bf97ead7f70432ea8300d67a28adbe776d449b6c02f7"
          }
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video> */}
    </div>
  );
};

export default VideoRecorderCustom;
