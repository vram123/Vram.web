import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Vram Ghazourian</p>
      <p>
        <a href="sms:3108542876">Text Me</a> ·
        <a href="mailto:ghazourian04@gmail.com">Email Me</a>
      </p>
    </footer>
  );
}

export default Footer;
