import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bot">
      <button className="bot-toggle" onClick={() => setOpen(v => !v)}>
        {open ? "Close" : "Chatbot"}
      </button>
      {open && (
        <div className="bot-panel">
          <div className="bot-title">Quick Links</div>
          <div className="quick-row">
            <button className="quick" onClick={() => goTo("education")}>Education</button>
            <button className="quick" onClick={() => goTo("experience")}>Experience</button>
            <button className="quick" onClick={() => goTo("projects")}>Projects</button>
            <button className="quick" onClick={() => goTo("skills")}>Skills</button>
          </div>
          <div className="quick-row">
            <button className="quick" onClick={() => window.open("https://github.com/vram123")}>GitHub</button>
            <button className="quick" onClick={() => window.open("https://linkedin.com/in/vram-ghazourian-9280b925b")}>LinkedIn</button>
          </div>
        </div>
      )}
    </div>
  );
}
