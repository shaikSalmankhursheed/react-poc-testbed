/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable formatjs/no-literal-string-in-jsx */
import React, { useRef, useState, useEffect } from "react";

const VideoRecorderCapture: React.FC = () => {
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
      <h1>Record Video</h1>
      <input type="file" accept="video/*" capture="user" onChange={handleVideoUpload} />
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {videoFile && <p>Video recorded successfully!</p>}
    </div>
  );
  //   const videoRef = useRef<HTMLVideoElement | null>(null);
  //   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  //   const [recording, setRecording] = useState<boolean>(false);
  //   const [videoURL, setVideoURL] = useState<string | null>(null);
  //   const [countdown, setCountdown] = useState<number>(60); // Countdown starts at 60 seconds
  //   useEffect(() => {
  //     // Check if device is mobile or desktop
  //     const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  //     const getUserMedia = async () => {
  //       try {
  //         const stream = await navigator.mediaDevices.getUserMedia({
  //           video: {
  //             // Set lower resolution for mobile to optimize performance
  //             width: isMobile ? 320 : 1280,
  //             height: isMobile ? 240 : 720,
  //             facingMode: isMobile ? { ideal: "environment" } : undefined, // Use the front camera for mobile
  //           },
  //         });
  //         if (videoRef.current) {
  //           videoRef.current.srcObject = stream;
  //         }
  //       } catch (err) {
  //         console.error("Error accessing media devices.", err);
  //         alert("Unable to access camera, please check permissions.");
  //       }
  //     };
  //     getUserMedia();
  //   }, []);
  //   const startRecording = () => {
  //     if (videoRef.current && videoRef.current.srcObject) {
  //       setRecording(true);
  //       setCountdown(60); // Reset countdown to 60 seconds
  //       const stream = videoRef.current.srcObject as MediaStream;
  //       const mediaRecorder = new MediaRecorder(stream);
  //       const chunks: BlobPart[] = [];
  //       mediaRecorderRef.current = mediaRecorder;
  //       mediaRecorder.ondataavailable = (e: BlobEvent) => {
  //         chunks.push(e.data);
  //       };
  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(chunks, { type: "video/mp4" });
  //         const videoURL = URL.createObjectURL(blob);
  //         setVideoURL(videoURL);
  //       };
  //       mediaRecorder.start();
  //       const countdownInterval = setInterval(() => {
  //         setCountdown((prevCountdown) => {
  //           if (prevCountdown > 1) {
  //             return prevCountdown - 1;
  //           } else {
  //             clearInterval(countdownInterval);
  //             mediaRecorder.stop();
  //             setRecording(false);
  //             return 0;
  //           }
  //         });
  //       }, 1000);
  //       // Stop recording automatically after 60 seconds
  //       setTimeout(() => {
  //         mediaRecorder.stop();
  //         setRecording(false);
  //         clearInterval(countdownInterval);
  //       }, 60000); // 60 seconds
  //     }
  //   };
  //   const stopRecording = () => {
  //     if (mediaRecorderRef.current) {
  //       mediaRecorderRef.current.stop();
  //       setRecording(false);
  //     }
  //   };
  //   // mouse testing
  //   const [trail, setTrail] = useState<any>([]);
  //   useEffect(() => {
  //     const handleMouseMove = (event: any) => {
  //       const newDot = {
  //         x: event.clientX,
  //         y: event.clientY,
  //         id: Date.now(),
  //       };
  //       setTrail((prevTrail: any) => [...prevTrail, newDot]);
  //       // Remove the dot after 50ms
  //       setTimeout(() => {
  //         setTrail((prevTrail: any) => prevTrail.filter((dot: any) => dot.id !== newDot.id));
  //       }, 150);
  //     };
  //     window.addEventListener("mousemove", handleMouseMove);
  //     return () => {
  //       window.removeEventListener("mousemove", handleMouseMove);
  //     };
  //   }, []);
  //   return (
  //     <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
  //       {trail.map((dot: any) => (
  //         <div
  //           key={dot.id}
  //           style={{
  //             position: "absolute",
  //             top: dot.y + "px",
  //             left: dot.x + "px",
  //             width: "20px",
  //             height: "20px",
  //             borderRadius: "50%",
  //             backgroundColor: "blue",
  //             pointerEvents: "none",
  //             transition: "opacity 0.2s",
  //             opacity: 0.8, // Optional fade-out effect
  //           }}
  //         />
  //       ))}
  //     </div>
  //     // <div>
  //     //   {" "}
  //     //   {!recording ? (
  //     //     <button onClick={startRecording}>Start Recording</button>
  //     //   ) : (
  //     //     <button onClick={stopRecording}>Stop Recording</button>
  //     //   )}
  //     //   <video ref={videoRef} autoPlay muted style={{ width: "100%", maxWidth: "90vw", height: "75vh" }} />
  //     //   <br />
  //     //   <br />
  //     //   {recording && <h3>Time Remaining: {countdown} seconds</h3>}
  //     //   {videoURL && (
  //     //     <div>
  //     //       <h3>Recorded Video:</h3>
  //     //       <video src={videoURL} controls style={{ width: "100%", maxWidth: "90vw", height: "90vh" }} />
  //     //     </div>
  //     //   )}
  //     // </div>
  //   );
};

export default VideoRecorderCapture;
