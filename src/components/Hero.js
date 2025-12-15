import React, { useRef } from "react";
import "./Hero.css";

function Hero() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const toggleDj = async () => {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v) return;

    // Decide based on real playback state (NOT React state)
    const isPlaying = !v.paused && !v.ended;

    try {
      if (isPlaying) {
        // ✅ STOP BOTH
        v.loop = false;
        v.pause();
        v.currentTime = 0;

        if (a) {
          a.pause();
          a.currentTime = 0;
        }
      } else {
        // ✅ START + LOOP
        // Keep video muted (visual only), music comes from mp3
        v.muted = true;
        v.loop = true;
        await v.play();

        if (a) {
          a.loop = true;
          a.volume = 0.65;
          await a.play();
        }
      }
    } catch (err) {
      console.warn("DJ playback blocked:", err);
      // If browser blocks play, user can click again
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Hi, I’m Vram Ghazourian</h1>
        <p className="hero-tagline">Computer Science Student | Aspiring Software Engineer</p>

        <div className="hero-icons">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            alt="GitHub"
            onClick={() => window.open("https://github.com/vram123", "_blank", "noopener,noreferrer")}
          />
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
            alt="LinkedIn"
            onClick={() =>
              window.open("https://linkedin.com/in/vram-ghazourian-9280b925b", "_blank", "noopener,noreferrer")
            }
          />
        </div>

        {/* ✅ DJ stays directly under icons */}
        <div className="djRow">
          <button
            type="button"
            className="djButton"
            onClick={toggleDj}
            aria-label="Toggle DJ music"
            title="Click to play/pause"
          >
            <video
              ref={videoRef}
              className="djVideo"
              src="/dj.mp4"
              playsInline
              preload="auto"
              muted
            />
            <div className="djHint">Click DJ to play / pause</div>
          </button>

          {/* ✅ MUSIC: put file in /public/dj-music.mp3 */}
          <audio ref={audioRef} src="/dj-music.mp3" preload="auto" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
