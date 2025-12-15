import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Chatbot.module.css";

const RESUME = {
  name: "Vram Ghazourian",
  phone: "310-854-2876",
  email: "ghazourian04@gmail.com",
  github: "https://github.com/vram123",
  linkedin: "https://linkedin.com/in/vram-ghazourian-9280b925b",
};

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s+/#.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasAny = (text, words) => words.some((w) => text.includes(w));

function isResumeScoped(userText) {
  const t = normalize(userText);
  const scopeWords = [
    "resume","cv",
    "education","school","university","csun","degree","gpa","coursework",
    "experience","work","intern","internship","job","role",
    "project","projects","capstone",
    "skills","languages","framework","frameworks","tools","database","databases",
    "github","linkedin","portfolio",
    "contact","email","phone","location","citizen","citizenship",
    "react","python","c++","sql","docker","aws","flask","tensorflow","opencv"
  ];
  return hasAny(t, scopeWords);
}

function answerResumeQuestion(userText) {
  const t = normalize(userText);

  if (hasAny(t, ["email", "contact"])) {
    return `Email: ${RESUME.email}\nPhone: ${RESUME.phone}\nLinkedIn: ${RESUME.linkedin}\nGitHub: ${RESUME.github}`;
  }
  if (hasAny(t, ["phone", "text", "call", "number"])) {
    return `Phone: ${RESUME.phone}\nEmail: ${RESUME.email}`;
  }
  if (hasAny(t, ["github"])) return `GitHub: ${RESUME.github}`;
  if (hasAny(t, ["linkedin"])) return `LinkedIn: ${RESUME.linkedin}`;

  // Professional “menu” fallback (still resume-only)
  return (
    `I can help with resume topics like:\n` +
    `• Education\n• Experience\n• Projects\n• Skills\n\n` +
    `What would you like to know?`
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [eyeMode, setEyeMode] = useState("idle"); // idle | typing
  const typingTimer = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      role: "bot",
      text:
        `Hi! I’m Vram’s resume assistant 🐶\n` +
        `Ask me about education, experience, projects, or skills.\n` +
        `If it’s not resume-related, I’ll direct you to email/text.`,
    },
  ]);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const quickLinks = useMemo(
    () => [
      { label: "Education", action: () => goTo("education") },
      { label: "Experience", action: () => goTo("experience") },
      { label: "Projects", action: () => goTo("projects") },
      { label: "Skills", action: () => goTo("skills") },
      { label: "GitHub", action: () => window.open(RESUME.github, "_blank", "noopener,noreferrer") },
      { label: "LinkedIn", action: () => window.open(RESUME.linkedin, "_blank", "noopener,noreferrer") },
    ],
    []
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function onDraftChange(e) {
    const v = e.target.value;
    setDraft(v);

    setEyeMode("typing");
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setEyeMode("idle"), 500);
  }

  function sendMessage(text) {
    const clean = (text || "").trim();
    if (!clean) return;

    setMessages((prev) => [...prev, { role: "user", text: clean }]);
    setDraft("");
    setIsTyping(true);

    setTimeout(() => {
      let botText = "";

      if (!isResumeScoped(clean)) {
        botText =
          `I’m designed to answer **resume-related** questions only.\n\n` +
          `For anything else, please reach out directly:\n` +
          `• Email: ${RESUME.email}\n` +
          `• Text/Call: ${RESUME.phone}`;
      } else {
        botText = answerResumeQuestion(clean);
      }

      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
      setIsTyping(false);
    }, 350);
  }

  function onSubmit(e) {
    e.preventDefault();
    sendMessage(draft);
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Resume chatbot">
          <div className={styles.header}>
            <div className={styles.puppy}>
              <div className={styles.puppyHead} aria-hidden="true">
                <div className={`${styles.eye} ${styles.left} ${eyeMode === "typing" ? styles.typing : ""}`} />
                <div className={`${styles.eye} ${styles.right} ${eyeMode === "typing" ? styles.typing : ""}`} />
                <div className={styles.nose} />
                <div className={styles.mouth} />
              </div>
              <div className={styles.caption}>
                <div className={styles.title}>Resume Assistant</div>
                <div className={styles.sub}>{RESUME.name}</div>
              </div>
            </div>

            <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className={styles.quickRow}>
            {quickLinks.map((q) => (
              <button key={q.label} className={styles.quick} onClick={q.action} type="button">
                {q.label}
              </button>
            ))}
          </div>

          <div className={styles.messages} aria-live="polite">
            {messages.map((m, idx) => (
              <div key={idx} className={`${styles.msg} ${m.role === "user" ? styles.user : styles.bot}`}>
                <div className={styles.bubble}>
                  {m.text.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.msg} ${styles.bot}`}>
                <div className={`${styles.bubble} ${styles.typingBubble}`}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form className={styles.inputRow} onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={draft}
              onChange={onDraftChange}
              placeholder="Ask about education, experience, projects, skills..."
            />
            <button type="submit">Send</button>
          </form>

          <div className={styles.footer}>
            <span>Resume-only.</span>
            <span className={styles.sep}>•</span>
            <button type="button" className={styles.link} onClick={() => window.open(`mailto:${RESUME.email}`)}>
              Email
            </button>
            <span className={styles.sep}>•</span>
            <button type="button" className={styles.link} onClick={() => window.open(`tel:${RESUME.phone}`)}>
              Call/Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
