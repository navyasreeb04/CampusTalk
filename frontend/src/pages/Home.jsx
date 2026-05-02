import {
  ArrowRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";

const heroTitle = "CAMPUSLIFE: In the Struggles & the chill we all live in";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    let timeoutId;
    let currentIndex = 0;

    const typeNextCharacter = () => {
      currentIndex += 1;
      const nextTitle = heroTitle.slice(0, currentIndex);
      setTypedTitle(nextTitle);

      if (currentIndex >= heroTitle.length) {
        return;
      }

      const latestCharacter = heroTitle[currentIndex - 1];
      let delay = 42;

      if (latestCharacter === " ") {
        delay = 180;
      }

      if (latestCharacter === ":" || latestCharacter === "&") {
        delay = 340;
      }

      timeoutId = window.setTimeout(typeNextCharacter, delay);
    };

    timeoutId = window.setTimeout(typeNextCharacter, 220);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="landing-shell">
      {!isAuthenticated ? <PublicNavbar /> : null}

      <div className="home-page">
        <section className="landing-hero">
          <div className="hero-ribbon">
            <span className="eyebrow">CampusTalk Platform</span>
            <span className="hero-status">
              <Sparkles size={14} />
              Student-first, peaceful, and premium
            </span>
          </div>

          <div className="hero-copy">
            <p className="typing-label">{typedTitle}</p>
            {/* <h2>
              A softer, smarter digital campus where students can vent, learn, and grow without
              feeling rushed.
            </h2> */}
            <p className="hero-description">
              CampusTalk brings together anonymous campus stories, peer-to-peer learning, and
              placement insights in one beautifully paced product experience.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="primary-button" to={isAuthenticated ? "/explore" : "/signup"}>
              <span>{isAuthenticated ? "Enter CampusBoard" : "Create Account"}</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="ghost-button" to={isAuthenticated ? "/skillmap" : "/login"}>
              {isAuthenticated ? "Open your space" : "Login"}
            </Link>
          </div>

          <div className="hero-story-grid">
            <article className="story-card">
              <span>Anonymous comfort</span>
              <p>
                Share campus thoughts, confessions, memes, and moments with media, comments, and
                live engagement.
              </p>
            </article>
            <article className="story-card">
              <span>Peer momentum</span>
              <p>
                Match with students who can teach what you need and move into one-to-one chat
                instantly.
              </p>
            </article>
            <article className="story-card">
              <span>Placement clarity</span>
              <p>
                Preserve interview journeys so the next student walks in with less fear and more
                context.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-column" id="modules">
          <div className="section-intro soft-section">
            <p className="eyebrow">Modules</p>
            <h2>Everything students need, placed vertically and clearly.</h2>
            <p>
              Each space feels focused on one job, but the platform still works like one connected
              campus product.
            </p>
          </div>

          <div className="feature-grid expanded-feature-grid">
            <article className="feature-card">
              <Compass size={22} />
              <h3>CampusBoard</h3>
              <p>
                Anonymous text and image posts with likes, permanent comments, trending, and a
                private MyFeed view.
              </p>
            </article>
            <article className="feature-card">
              <GraduationCap size={22} />
              <h3>SkillMap</h3>
              <p>
                Students post what they know, what they want to learn, and continue the exchange in
                direct chat.
              </p>
            </article>
            <article className="feature-card">
              <ShieldCheck size={22} />
              <h3>PlacementPulse</h3>
              <p>
                Anonymous placement experiences, OA questions, interview rounds, and comments that
                stay useful over time.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-column" id="why-campustalk">
          <div className="section-intro soft-section">
            <p className="eyebrow">Why it feels better</p>
            <h2>Not crowded. Not noisy. Just enough structure to make student life feel lighter.</h2>
          </div>

          <div className="peace-grid">
            <article className="peace-card">
              <HeartHandshake size={24} />
              <h3>Calm reading pace</h3>
              <p>
                Wider spacing, softer colors, and slower visual rhythm make the content easier to
                absorb without stress.
              </p>
            </article>
            <article className="peace-card">
              <Sparkles size={24} />
              <h3>Meaningful motion</h3>
              <p>
                Gentle typing, fade-ups, and soft hover states add life without making the app feel
                busy or distracting.
              </p>
            </article>
            <article className="peace-card">
              <ArrowRight size={24} />
              <h3>Clear next step</h3>
              <p>
                Students can create an account, log in, and move into the right module without
                guessing where to go next.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
