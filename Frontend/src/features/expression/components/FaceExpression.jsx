import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import "./FaceExpression.scss";

export default function FaceExpression() {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const audioRef = useRef(new Audio());
  const currentEmotionRef = useRef("Neutral");

  const [emotion, setEmotion] = useState("Neutral");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoMode, setAutoMode] = useState(true); // ✅ controls auto mood sync

  // 🎵 Mood Playlists
  const playlists = {
    Happy: ["/music/eliveta-happy-491187.mp3"],
    Sad: ["/music/the_mountain-sad-sad-music-490012.mp3"],
    Excited: ["/music/hitslab-exciting-upbeat-background-music-300654.mp3"],
    Surprised: ["/music/syouki_takahashi-surprise-attack-288092.mp3"],
    Neutral: ["/music/senormusica81-ambient-neutral-v1-456870.mp3"],
  };
  const emotionColors = {
  Happy: "#FFD93D",
  Sad: "#4D96FF",
  Excited: "#FF6B6B",
  Surprised: "#9D4EDD",
  Neutral: "#888888",
};

  // 🚀 Initialize Face Detection
  useEffect(() => {
    const initialize = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );


      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: true,
        numFaces: 1,
      });

      faceLandmarkerRef.current = faceLandmarker;
      startCamera();
    };

    initialize();
  }, []);
  useEffect(() => {
  const root = document.querySelector(".app");

  const colors = {
    Happy: "#FFD93D",
    Sad: "#4D96FF",
    Excited: "#FF6B6B",
    Surprised: "#9D4EDD",
    Neutral: "#888888",
  };

  root.style.background = `radial-gradient(circle at top, ${colors[emotion]}33, #000)`;
}, [emotion]);

  // 📷 Start Camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    detect();
  };

  // 🎭 Emotion Detection (UNCHANGED)
  const detect = () => {
    const video = videoRef.current;

    const loop = async () => {
      if (
        faceLandmarkerRef.current &&
        video &&
        video.readyState === 4
      ) {
        const results =
          await faceLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

        if (results?.faceBlendshapes?.length > 0) {
          const shapes = results.faceBlendshapes[0].categories;

          const getScore = (name) =>
            shapes.find((s) => s.categoryName === name)?.score || 0;

          const smile =
            (getScore("mouthSmileLeft") +
              getScore("mouthSmileRight")) / 2;

          const jawOpen = getScore("jawOpen");

          const browDown =
            (getScore("browDownLeft") +
              getScore("browDownRight")) / 2;

          const eyeWide =
            (getScore("eyeWideLeft") +
              getScore("eyeWideRight")) / 2;

          let detectedEmotion = "Neutral";

          if (jawOpen > 0.001 && eyeWide > 0.01) {
            detectedEmotion = "Surprised";
          }
          else if (smile > 0.6 && jawOpen > 0.001) {
            detectedEmotion = "Excited";
          }
          else if (browDown > 0.020 && smile < 0.4) {
            detectedEmotion = "Sad";
          }
          else if (smile > 0.65 && jawOpen < 0.4) {
            detectedEmotion = "Happy";
          }

          setEmotion(detectedEmotion);
        }
      }

      requestAnimationFrame(loop);
    };

    loop();
  };

  // 🎵 Auto Play When Emotion Changes
  useEffect(() => {
    if (!autoMode) return; // ✅ stop disables auto mode

    if (emotion !== currentEmotionRef.current) {
      currentEmotionRef.current = emotion;

      const playlist = playlists[emotion];

      if (playlist && playlist.length > 0) {
        const randomSong =
          playlist[Math.floor(Math.random() * playlist.length)];

        audioRef.current.pause();
        audioRef.current.src = randomSong;
        audioRef.current.load();

        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log("Click anywhere to enable audio.");
          });
      }
    }
  }, [emotion, autoMode]);

  // ▶ Play / Pause
  const togglePlay = () => {
    if (!audioRef.current.src) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAutoMode(true); // re-enable mood sync
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ⏹ Stop
  const stopMusic = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setAutoMode(false); // disable auto mood switching
  };

  // 📊 Progress Tracking
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current.duration) {
        const percent =
          (audioRef.current.currentTime /
            audioRef.current.duration) *
          100;
        setProgress(percent);
      }
    };

    audioRef.current.addEventListener("timeupdate", updateProgress);

    return () => {
      audioRef.current.removeEventListener(
        "timeupdate",
        updateProgress
      );
    };
  }, []);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      audioRef.current.pause();
    };
  }, []);

  return (
    <div className={`app ${emotion.toLowerCase()}`}>
      <div className="player-container">

        <div className="left-panel">
          <h2 className="head">AI Mood DJ</h2>

          <div className="video-card">
            <video ref={videoRef} autoPlay muted />
          </div>

          <div className="album-wrapper">
  <div
    className={`album-art ${isPlaying ? "spin" : ""}`}
    style={{
      background: `radial-gradient(circle at 30% 30%, ${emotionColors[emotion]}, #000)`
    }}
  />
  <div className="album-center">
    {emotion}
  </div>
</div>

          <div className="controls">
            <button onClick={togglePlay}>
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button onClick={stopMusic}>
              Stop
            </button>
          </div>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <h1 className="emotion-text">{emotion}</h1>
        </div>

        <div className="right-panel">
          <h3>Playlists</h3>

          {Object.keys(playlists).map((key, index) => (
            <div
              key={index}
              className={`playlist-item ${
                emotion === key ? "active" : ""
              }`}
            >
              {key}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}