import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Vram Resume Chatbot (Single-file, Collision-proof, Puppy Edition)
 * - No external CSS
 * - Inline styles only (prevents your site CSS from breaking it)
 * - Handles resume questions + basic “about Vram” logic questions
 * - If out-of-scope: directs to email/text
 */

export default function Chatbot() {
  /* ===================== CONFIG: UPDATE THESE ONCE ===================== */
  const PROFILE = useMemo(
    () => ({
      name: "Vram Ghazourian",
      age: 21, // per your request
      email: "ghazourian04@gmail.com",
      phone: "310-854-2876",
      github: "https://github.com/vram123",
      linkedin: "https://linkedin.com/in/vram-ghazourian-9280b925b",
      location: "Winnetka, CA",
      expectedSalary: { min: 70000, max: 100000, currency: "USD" }, // per your request
      // A short, professional “smart” response
      smartAnswer:
        "Yes — Vram is highly capable and consistently demonstrates strong problem-solving and learning ability through his coursework, projects, and internships.",
    }),
    []
  );

  /**
   * Structured roles for “years of experience” questions.
   * NOTE: Edit these to match your real resume timeline if needed.
   * Format: YYYY-MM.
   */
  const EXPERIENCE_ROLES = useMemo(
    () => [
      {
        title: "Software Engineering Intern",
        org: "Amazon / Whole Foods",
        start: "2024-10",
        end: "2025-02",
        tags: ["software", "engineering", "intern"],
      },
      {
        title: "Software Developer Research (Intern)",
        org: "FromZeroLLC",
        start: "2025-08",
        end: "2025-10",
        tags: ["software", "engineering", "research", "intern"],
      },
      {
        title: "Co-Founder & Software Engineer",
        org: "TapIt",
        start: "2025-10",
        end: "present",
        tags: ["software", "engineering", "founder"],
      },
    ],
    []
  );

  /* ===================== STATE ===================== */
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [eyeDown, setEyeDown] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [messages, setMessages] = useState(() => [
    {
      role: "bot",
      text:
        `Hi! I’m ${PROFILE.name}’s assistant 🐶\n\n` +
        `You can ask about Vram’s resume (education, experience, projects, skills), or quick “about Vram” questions like age or expected salary.\n` +
        `If something is outside my scope, I’ll direct you to email/text.`,
    },
  ]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimer = useRef(null);

  /* ===================== UTILITIES ===================== */
  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .replace(/[^\w\s$.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const compact = (s) => normalize(s).replace(/\s+/g, "");

  const nowYM = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${String(m).padStart(2, "0")}`;
  };

  const parseYM = (ym) => {
    const [y, m] = String(ym).split("-").map(Number);
    if (!y || !m) return null;
    return { y, m };
  };

  // months inclusive-ish; good for portfolio estimates
  const monthsBetween = (startYM, endYM) => {
    const s = parseYM(startYM);
    const e = parseYM(endYM);
    if (!s || !e) return 0;
    return Math.max(0, (e.y - s.y) * 12 + (e.m - s.m) + 1);
  };

  const formatYears = (months) => {
    if (months <= 0) return "0 months";
    if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
    const years = months / 12;
    return `${years.toFixed(1)} years`;
  };

  const totalMonthsForRoles = (roles) => {
    let months = 0;
    for (const r of roles) {
      const end = r.end === "present" ? nowYM() : r.end;
      months += monthsBetween(r.start, end);
    }
    return months;
  };

  const moneyRange = (min, max, currency) => {
    const fmt = (n) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(n);
    return `${fmt(min)}–${fmt(max)}`;
  };

  /* ===================== INTENTS ===================== */
  const INTENT = useMemo(
    () => ({
      // About Vram
      age: ["how old", "age", "old is he", "old is vram"],
      smart: ["is vram smart", "is he smart", "smart", "intelligent"],
      salary: ["expected salary", "salary", "compensation", "pay range", "how much does he want", "how much money"],

      // Resume scope
      education: ["education", "school", "university", "csun", "degree", "gpa", "coursework"],
      experience: ["experience", "work", "intern", "internship", "job", "role"],
      projects: ["projects", "project", "capstone", "classlink", "outfit matcher", "tensorflow", "opencv"],
      skills: ["skills", "languages", "frameworks", "tools", "databases", "stack"],

      // Experience math
      yearsExp: [
        "how many years",
        "years of experience",
        "how much experience",
        "how long have",
        "experience do you have",
      ],

      // Contact
      contact: ["email", "phone", "contact", "linkedin", "github"],
    }),
    []
  );

  function includesAny(text, list) {
    const t = normalize(text);
    return list.some((k) => t.includes(k));
  }

  function detectIntent(userText) {
    const t = normalize(userText);
    const tc = compact(userText);

    // Experience years intent (detect “years” + “experience” even if phrased weird)
    const yearsSignal =
      tc.includes("yearsofexperience") ||
      (tc.includes("years") && tc.includes("experience")) ||
      INTENT.yearsExp.some((k) => t.includes(k));

    if (yearsSignal && (tc.includes("software") || tc.includes("engineering") || tc.includes("softwareengineering"))) {
      return "yearsExpSoftware";
    }
    if (yearsSignal) return "yearsExpGeneral";

    // About Vram
    if (includesAny(t, INTENT.age)) return "age";
    if (includesAny(t, INTENT.smart)) return "smart";
    if (includesAny(t, INTENT.salary)) return "salary";

    // Contact
    if (includesAny(t, INTENT.contact)) return "contact";

    // Resume buckets
    if (includesAny(t, INTENT.education)) return "education";
    if (includesAny(t, INTENT.experience)) return "experience";
    if (includesAny(t, INTENT.projects)) return "projects";
    if (includesAny(t, INTENT.skills)) return "skills";

    return "unknown";
  }

  /**
   * Scope policy:
   * - We answer: resume topics + “about Vram” (age, salary, smart) + contact links.
   * - Anything else -> email/text.
   */
  function isInScope(intent) {
    return (
      intent === "age" ||
      intent === "smart" ||
      intent === "salary" ||
      intent === "contact" ||
      intent === "education" ||
      intent === "experience" ||
      intent === "projects" ||
      intent === "skills" ||
      intent === "yearsExpSoftware" ||
      intent === "yearsExpGeneral"
    );
  }

  function answer(userText) {
    const intent = detectIntent(userText);

    if (!isInScope(intent)) {
      return (
        `I’m built to answer questions about Vram (resume + basic details) only.\n\n` +
        `For anything else, please reach out directly:\n` +
        `• Email: ${PROFILE.email}\n` +
        `• Text/Call: ${PROFILE.phone}`
      );
    }

    // About Vram
    if (intent === "age") {
      return `${PROFILE.name} is ${PROFILE.age}.`;
    }

    if (intent === "smart") {
      // Professional response (not goofy)
      return PROFILE.smartAnswer;
    }

    if (intent === "salary") {
      const r = PROFILE.expectedSalary;
      return (
        `Expected salary range: ${moneyRange(r.min, r.max, r.currency)}.\n` +
        `Final compensation can vary based on role scope, location, and total benefits.`
      );
    }

    // Contact
    if (intent === "contact") {
      const r = PROFILE.expectedSalary;
      return (
        `Contact & Links\n` +
        `• Email: ${PROFILE.email}\n` +
        `• Phone: ${PROFILE.phone}\n` +
        `• GitHub: ${PROFILE.github}\n` +
        `• LinkedIn: ${PROFILE.linkedin}\n\n` +
        `Expected salary range: ${moneyRange(r.min, r.max, r.currency)}`
      );
    }

    // Experience math
    if (intent === "yearsExpSoftware") {
      const relevant = EXPERIENCE_ROLES.filter(
        (r) => r.tags.includes("software") && r.tags.includes("engineering")
      );
      const months = totalMonthsForRoles(relevant);
      return (
        `Based on the roles listed, Vram has approximately ${formatYears(months)} of software engineering experience.\n\n` +
        `If you want a breakdown, ask: “Which roles count toward that?”`
      );
    }

    if (intent === "yearsExpGeneral") {
      const months = totalMonthsForRoles(EXPERIENCE_ROLES);
      return (
        `Based on the roles listed, Vram has approximately ${formatYears(months)} of overall professional experience represented here.\n\n` +
        `If you mean “software engineering experience” specifically, include “software engineering” in your question.`
      );
    }

    // Resume buckets (short professional summaries)
    if (intent === "education") {
      return (
        `Education\n` +
        `• B.S. in Computer Science (CSUN)\n` +
        `• Location: ${PROFILE.location}\n\n` +
        `If you want specifics (coursework/GPA), ask: “What coursework did he take?”`
      );
    }

    if (intent === "experience") {
      return (
        `Experience (highlights)\n` +
        `• Software Engineering Intern — Amazon / Whole Foods\n` +
        `• Software Developer Research (Intern) — FromZeroLLC\n` +
        `• Co-Founder & Software Engineer — TapIt\n\n` +
        `Ask: “Tell me about his Amazon internship” or “What did he build at TapIt?”`
      );
    }

    if (intent === "projects") {
      return (
        `Projects (highlights)\n` +
        `• ClassLink (full-stack)\n` +
        `• AI Outfit Matcher (TensorFlow + OpenCV)\n` +
        `• VFX / Virtual Production workflow prototypes\n\n` +
        `Ask: “What stack did he use for AI Outfit Matcher?”`
      );
    }

    if (intent === "skills") {
      return (
        `Skills (high-level)\n` +
        `• Front-end: React, JavaScript, HTML/CSS\n` +
        `• Back-end: Node/Flask (project-dependent)\n` +
        `• Data/AI: Python, TensorFlow/OpenCV (project-dependent)\n` +
        `• Core: Problem-solving, fast learning, teamwork\n\n` +
        `Ask: “What are his strongest skills?” for a more tailored summary.`
      );
    }

    // Fallback (shouldn’t happen)
    return (
      `I can help with:\n` +
      `• Education\n• Experience\n• Projects\n• Skills\n• Age\n• Expected salary\n\n` +
      `What would you like to know?`
    );
  }

  /* ===================== EVENTS ===================== */
  function sendMessage() {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setDraft("");

    setIsBotTyping(true);
    setTimeout(() => {
      const reply = answer(text);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      setIsBotTyping(false);
    }, 350);
  }

  function onDraftChange(e) {
    setDraft(e.target.value);

    // eyes look down while typing
    setEyeDown(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setEyeDown(false), 450);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ===================== SCROLL / FOCUS ===================== */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  /* ===================== INLINE STYLES ===================== */
  const S = {
    wrap: {
      position: "fixed",
      right: 18,
      bottom: 18,
      zIndex: 99999,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    },
    toggle: {
      border: "none",
      borderRadius: 999,
      padding: "12px 16px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
      background: "#0f172a",
      color: "#fff",
      letterSpacing: 0.2,
    },
    panel: {
      width: expanded ? 520 : 370,
      height: expanded ? 720 : 560,
      maxWidth: "calc(100vw - 24px)",
      maxHeight: "calc(100vh - 80px)",
      background: "#ffffff",
      borderRadius: 18,
      marginBottom: 12,
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 18px 44px rgba(0,0,0,0.25)",
      overflow: "hidden",
      border: "1px solid rgba(2,6,23,0.10)",
      transition: "width 200ms ease, height 200ms ease",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderBottom: "1px solid rgba(2,6,23,0.10)",
      background: "#f8fafc",
    },
    puppy: { display: "flex", alignItems: "center", gap: 10 },
    puppyHead: {
      width: 44,
      height: 44,
      background: "#f59e0b",
      borderRadius: 14,
      position: "relative",
      boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.10)",
      flexShrink: 0,
    },
    eye: (side) => ({
      width: 10,
      height: 10,
      borderRadius: 999,
      background: "#0f172a",
      position: "absolute",
      top: eyeDown ? 18 : 14,
      left: side === "left" ? 11 : "auto",
      right: side === "right" ? 11 : "auto",
      transition: "top 140ms ease",
    }),
    eyeGlint: {
      width: 4,
      height: 4,
      borderRadius: 999,
      background: "rgba(255,255,255,0.9)",
      position: "absolute",
      top: 2,
      left: 2,
    },
    nose: {
      width: 10,
      height: 8,
      borderRadius: 999,
      background: "#0f172a",
      position: "absolute",
      left: "50%",
      top: 24,
      transform: "translateX(-50%)",
    },
    mouth: {
      width: 14,
      height: 8,
      border: "2px solid rgba(15,23,42,0.95)",
      borderTop: 0,
      borderLeft: 0,
      borderRight: 0,
      position: "absolute",
      left: "50%",
      top: 31,
      transform: "translateX(-50%)",
      borderRadius: "0 0 999px 999px",
      opacity: 0.85,
    },
    headerText: { lineHeight: 1.1 },
    title: { fontWeight: 950, fontSize: 13, color: "#0f172a" },
    subtitle: { fontSize: 12, color: "#64748b" },
    close: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      borderRadius: 10,
      padding: "8px 10px",
      color: "#334155",
      fontWeight: 900,
    },
    closeHover: { background: "rgba(2,6,23,0.06)" },

    quickRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      padding: "10px 12px",
      borderBottom: "1px solid rgba(2,6,23,0.10)",
      background: "#ffffff",
    },
    quick: {
      border: "1px solid rgba(2,6,23,0.14)",
      background: "#f1f5f9",
      color: "#0f172a",
      padding: "8px 10px",
      borderRadius: 999,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 900,
    },

    messages: {
      flex: 1,
      padding: 12,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      background: "#ffffff",
    },
    bubble: (role) => ({
      alignSelf: role === "user" ? "flex-end" : "flex-start",
      background: role === "user" ? "rgba(59,130,246,0.14)" : "#f1f5f9",
      border: "1px solid rgba(2,6,23,0.10)",
      color: "#0f172a",
      padding: "10px 12px",
      borderRadius: 16,
      maxWidth: "86%",
      whiteSpace: "pre-wrap",
      fontSize: 13,
      lineHeight: 1.25,
    }),

    typingBubble: {
      display: "inline-flex",
      gap: 6,
      alignItems: "center",
    },
    dot: (delayMs) => ({
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "rgba(15,23,42,0.55)",
      animation: `vrBounce 900ms infinite`,
      animationDelay: `${delayMs}ms`,
    }),

    inputRow: {
      display: "flex",
      gap: 8,
      padding: "10px 12px 12px",
      borderTop: "1px solid rgba(2,6,23,0.10)",
      background: "#f8fafc",
    },
    input: {
      flex: 1,
      borderRadius: 12,
      border: "1px solid rgba(2,6,23,0.16)",
      padding: "10px 10px",
      fontSize: 13,
      color: "#0f172a",
      background: "#ffffff",
      outline: "none",
    },
    send: {
      border: "none",
      borderRadius: 12,
      padding: "10px 12px",
      cursor: "pointer",
      fontWeight: 950,
      background: "#22c55e",
      color: "#052e16",
    },
    footer: {
      padding: "8px 12px 10px",
      fontSize: 11,
      color: "#475569",
      borderTop: "1px solid rgba(2,6,23,0.10)",
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
    },
    linkBtn: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontWeight: 950,
      color: "#2563eb",
      padding: 0,
    },
    sep: { opacity: 0.6 },
  };

  // Small CSS keyframes injected once (still single-file)
  const Keyframes = () => (
    <style>
      {`
        @keyframes vrBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}
    </style>
  );

  /* ===================== RENDER ===================== */
  return (
    <div style={S.wrap}>
      <Keyframes />

      <button
  style={S.toggle}
  onClick={() => {
    setOpen((v) => !v);
    if (open) setExpanded(false); // reset when closing
  }}
>
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div style={S.panel} role="dialog" aria-label="Vram resume chatbot">
          <div style={S.header}>
            <div style={S.puppy}>
              <div style={S.puppyHead} aria-hidden="true">
                <div style={S.eye("left")}>
                  <div style={S.eyeGlint} />
                </div>
                <div style={S.eye("right")}>
                  <div style={S.eyeGlint} />
                </div>
                <div style={S.nose} />
                <div style={S.mouth} />
              </div>

              <div style={S.headerText}>
                <div style={S.title}>Resume Assistant</div>
                <div style={S.subtitle}>{PROFILE.name}</div>
              </div>
            </div>

            <button style={S.close} onClick={() => setOpen(false)} aria-label="Close chatbot">
              ✕
            </button>
          </div>

          <div style={S.quickRow}>
            <button style={S.quick} type="button" onClick={() => window.open(PROFILE.github, "_blank", "noopener,noreferrer")}>
              GitHub
            </button>
            <button style={S.quick} type="button" onClick={() => window.open(PROFILE.linkedin, "_blank", "noopener,noreferrer")}>
              LinkedIn
            </button>
            <button
              style={S.quick}
              type="button"
              onClick={() =>
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "bot",
                    text:
                      `Try asking:\n` +
                      `• “How many years of software engineering experience?”\n` +
                      `• “How old is Vram?”\n` +
                      `• “What’s his expected salary?”\n` +
                      `• “Is Vram smart?”`,
                  },
                ])
              }
            >
              Examples
            </button>
          </div>

          <div style={S.messages} aria-live="polite">
            {messages.map((m, idx) => (
              <div key={idx} style={S.bubble(m.role)}>
                {m.text}
              </div>
            ))}

            {isBotTyping && (
              <div style={S.bubble("bot")}>
                <div style={S.typingBubble}>
                  <span style={S.dot(0)} />
                  <span style={S.dot(150)} />
                  <span style={S.dot(300)} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div style={S.inputRow}>
            <input
              ref={inputRef}
              style={S.input}
              value={draft}
              onChange={onDraftChange}
              onKeyDown={onKeyDown}
              placeholder="Ask a question about Vram…"
              aria-label="Chat input"
            />
            <button style={S.send} onClick={sendMessage} type="button">
              Send
            </button>
          </div>

          <div style={S.footer}>
  <span>Contact:</span>

  <button
    style={S.linkBtn}
    type="button"
    onClick={() => window.open(`mailto:${PROFILE.email}`, "_blank")}
  >
    Email
  </button>

  <span style={S.sep}>•</span>

  <button
    style={S.linkBtn}
    type="button"
    onClick={() => window.open(`tel:${PROFILE.phone}`, "_self")}
  >
    Call/Text
  </button>

  <span style={S.sep}>•</span>

  <button
    style={S.linkBtn}
    type="button"
    onClick={() => setExpanded((v) => !v)}
  >
    {expanded ? "Collapse" : "Expand"}
  </button>
</div>

        </div>
      )}
    </div>
  );
}
