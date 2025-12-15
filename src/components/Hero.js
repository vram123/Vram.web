import React from "react";

function Hero() {
  return (
    <section className="hero">
      <h1>Hi, I’m Vram Ghazourian</h1>
      <p>Computer Science Student | Aspiring Software Engineer</p>
      <div className="hero-icons">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
          alt="GitHub"
          onClick={() => window.open("https://github.com/vram123")}
        />
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
          alt="LinkedIn"
          onClick={() => window.open("https://linkedin.com/in/vram-ghazourian-9280b925b")}
        />
      </div>
    </section>
  );
}

export default Hero;
