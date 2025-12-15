import React from "react";

export default function Header({ onNav }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">Vram Ghazourian</div>
        <nav className="nav">
          <a href="#education" onClick={(e)=>{e.preventDefault(); onNav("education");}}>Education</a>
          <a href="#experience" onClick={(e)=>{e.preventDefault(); onNav("experience");}}>Experience</a>
          <a href="#projects" onClick={(e)=>{e.preventDefault(); onNav("projects");}}>Projects</a>
          <a href="#skills" onClick={(e)=>{e.preventDefault(); onNav("skills");}}>Skills</a>
        </nav>
      </div>
    </header>
  );
}
