import React, { useEffect, useRef, useState } from "react";

function Info({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="info-btn" onClick={() => setOpen(v => !v)}>
        {open ? "Hide Details" : "Read More"}
      </button>
      {open && <div className="details">{children}</div>}
    </>
  );
}

function Section({ id, title, children }) {
  const [visible, setVisible] = useState(false);
  const elRef = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    if (elRef.current) obs.observe(elRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id={id} ref={elRef} className={`section ${visible ? "section-visible" : ""}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Resume() {
  return (
    <div className="container">
      {/* Education */}
      <Section id="education" title="Education">
        <div className="card">
          <h3>California State University, Northridge</h3>
          <p className="meta">B.S. Computer Science (Aug 2022 – May 2026, GPA 3.95/4.0)</p>
          <Info>
            <ul>
              <li>Dean’s List & Honors Student</li>
              <li>Active in CSUN Computer Science Club; competed in hackathons and coding challenges</li>
              <li>Relevant Coursework: Computer Organization, Data Structures, Foundations of Programming, Algorithms & Analysis</li>
            </ul>
          </Info>
        </div>
      </Section>

      {/* Work Experience */}
      <Section id="experience" title="Work Experience">
        <div className="card">
          <h3>Co-Founder & Software Engineer — TapIt, Los Angeles, CA</h3>
          <p className="meta">Oct 2025 – Present</p>
          <Info>
            <ul>
              <li>Founded TapIt, a start-up delivering NFC-enabled “ETF Cards” that link users directly to personalized digital profiles.</li>
              <li>Scaled production and distribution, selling 200+ cards and donating all profits to charity.</li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>Software Developer Intern — FromZeroLLC (Remote)</h3>
          <p className="meta">Aug 2025 – Oct 2025</p>
          <Info>
            <ul>
              <li>Developed Virtual Brand Integration (VBI) technology for streaming platforms, enabling context-aware, non-disruptive brand placement within video content.</li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>Teacher & Manager Intern — Rolling Robots, Palos Verdes, CA</h3>
          <p className="meta">Jun 2025 – Aug 2025</p>
          <Info>
            <ul>
              <li>Led instruction for 50+ students in Python, Java, C++, and C#, emphasizing how code drives robotic functionality.</li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>Software Engineering Intern — Amazon / Whole Foods Market – Los Angeles, CA </h3>
          <p className="meta">October 2024 – February 2025</p>
          <Info>
            <ul>
              <li>Built data automation scripts in Python to streamline restocking workflows, reducing manual processing time by ~30%.</li>
              <li>Enhanced data reliability by writing monitoring scripts that caught and logged 1,000 real-time system anomalies</li>
            </ul>
          </Info>
        </div>
      </Section>

      {/* Projects */}
      <Section id="projects" title="Projects">
        <div className="card">
          <h3>ClassLink — CSUN COMP 380 Capstone (Full-Stack Web App)</h3>
          <p className="meta">React.js | Flask REST API | MongoDB | bcrypt | 2025</p>
          <Info>
            <ul>
              <li>Built and deployed a full-stack platform connecting students by shared courses/interests, reaching 50+ pilot users.</li>
              <li>Integrated secure authentication with bcrypt for data privacy and trust.</li>
              <li><a href="https://cs380classlink.com/get_started" target="_blank" rel="noreferrer">Demo Link</a></li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>Virtual Production & Senior Role Simulation</h3>
          <p className="meta">Unreal Engine | Project Management Tools | 2025</p>
          <Info>
            <ul>
              <li>Developed a prototype reflecting modern virtual production workflows.</li>
              <li>Practiced leadership through design, implementation, and review cycles to refine the pipeline.</li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>VFX Workflow Development</h3>
          <p className="meta">C++ | Python | Multimedia Tools | 2025</p>
          <Info>
            <ul>
              <li>Developed a prototype simulating modern virtual production pipelines.</li>
              <li>Led updates, managed deliverables, and coordinated team efforts.</li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>AI Outfit Matcher</h3>
          <p className="meta">React Native | Flask | PostgreSQL | OpenCV | TensorFlow | 2025</p>
          <Info>
            <ul>
              <li>Built an AI-powered mobile + web app that recommends outfits based on uploaded wardrobe photos.</li>
              <li>Implemented computer vision with OpenCV + TensorFlow to classify clothing items with 90% accuracy.</li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>The Reckoning — Data Deep Dive</h3>
          <p className="meta">Python | SQL | Data Analysis | 2024</p>
          <Info>
            <ul>
              <li>Collected and analyzed large gaming/QA datasets to identify patterns in user behavior and bug frequency.</li>
              <li>Simulated real-world job transitions by balancing new responsibilities with legacy workflows.</li>
            </ul>
          </Info>
        </div>
      </Section>

      {/* Fun Projects */}
      <Section id="fun-projects" title="Personal Favorite Projects">
        <div className="card">
          <h3>Roulette Simulator </h3>
          <p className="meta">Js, Java, Python | Probability & Randomization | 2025</p>
          <Info>
            <ul>
              <li>Developed a console-based roulette game where players place bets and spin a randomized wheel.</li>
              <li>Implemented modular functions for betting logic, outcome calculation, and bankroll tracking.</li>
              <li>
                <a href="https://vram-roulette.vercel.app" target="_blank" rel="noreferrer">
                  Play Roulette
                </a>
              </li>
            </ul>
          </Info>
        </div>

        <div className="card">
          <h3>Blackjack Game </h3>
          <p className="meta">JS, Java | Object-Oriented Programming | 2025</p>
          <Info>
            <ul>
              <li>Created a fully interactive blackjack game with dealer AI, hit/stand options, and replay functionality.</li>
              <li>Used structs and arrays to simulate cards, decks, and score tracking in a text-based interface.</li>
              <li>
                <a href="https://vramblackjack.vercel.app" target="_blank" rel="noreferrer">
                  Play Blackjack
                </a>
              </li>
            </ul>
          </Info>
        </div>
        <div className="card">
          <h3>Slots Game </h3>
          <p className="meta">JS, Java | Object-Oriented Programming and React | 2025</p>
          <Info>
            <ul>
              <li>Created a slot machine game, Weighted reel system, rare 7s + diamonds just like the real thing</li>
              <li>Reel-spin animation + slow “tease” when you are close to hitting triple 7s.</li>
              <li>
                <a href="https://slot-machine-react.vercel.app" target="_blank" rel="noreferrer">
                  Slots
                </a>
              </li>
            </ul>
          </Info>
        </div>
      </Section>

      {/* Skills */}
      <Section id="skills" title="Technical Skills">
        <div className="card">
          <Info>
            <ul>
              <li><strong>Programming Languages:</strong> Java, JavaScript, HTML, CSS, Python, C#, C++, SQL, Rust</li>
              <li><strong>Frameworks & Libraries:</strong> React.js, Node.js, Flask, Django, TensorFlow, PyTorch, OpenCV, Bootstrap, Chart.js</li>
              <li><strong>Databases:</strong> MongoDB, PostgreSQL, MySQL</li>
              <li><strong>Developer Tools:</strong> Git, Docker, AWS, Raspberry Pi, Figma</li>
              <li><strong>Specialties:</strong> Full-Stack Development, Machine Learning, Computer Vision, IoT Systems, Data Visualization</li>
            </ul>
          </Info>
        </div>
      </Section>
    </div>
  );
}

export default Resume;
