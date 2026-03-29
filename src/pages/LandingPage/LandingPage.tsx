import React, { type FC } from "react";
import type { ToastType } from "../../types";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import HeroCanvas from "../../components/HeroCanvas/HeroCanvas";
import StatItem from "../../components/StatItem/StatItem";
import {
  Brain,
  Network,
  Map,
  Search,
  Eye,
  Compass
} from "lucide-react";
import "./LandingPage.css";

interface LandingPageProps {
  showToast: (msg: string, type?: ToastType) => void;
}

const features = [
  {
    icon: <Brain size={20} />,
    title: "Learning Gap Detection",
    desc: "Identify not just weak topics, but the exact missing prerequisite concepts causing failure."
  },
  {
    icon: <Network size={20} />,
    title: "Concept Dependency Mapping",
    desc: "Visualize how topics are interconnected across subjects to understand the full learning structure."
  },
  {
    icon: <Map size={20} />,
    title: "Structured Roadmaps",
    desc: "Follow clear, step-by-step learning paths designed to eliminate confusion and fragmentation."
  },
  {
    icon: <Search size={20} />,
    title: "Root Cause Analysis",
    desc: "Pinpoint why a student struggles by tracing back through prerequisite knowledge gaps."
  },
  {
    icon: <Eye size={20} />,
    title: "Visual Learning System",
    desc: "Replace scattered resources with organized, visual roadmaps for faster understanding."
  },
  {
    icon: <Compass size={20} />,
    title: "Domain-Based Paths",
    desc: "Explore structured journeys across fields like Backend, AI, DevOps, and more."
  },
];

const steps = [
  {
    title: "Choose a Domain",
    desc: "Select a learning path like Backend, AI, or Data Engineering from the dashboard."
  },
  {
    title: "View Roadmap",
    desc: "Understand the full concept structure and dependencies in a visual format."
  },
  {
    title: "Identify Gaps",
    desc: "Spot missing prerequisite knowledge that blocks your progress."
  },
  {
    title: "Learn Systematically",
    desc: "Follow a structured path to build strong, connected understanding."
  },
];

const LandingPage: FC<LandingPageProps> = ({ showToast }) => {
  const navigate = useNavigate();
  return (
    <div className="landing-page">
      <Nav />

      <HeroCanvas />

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stats-bar__inner container">
          <StatItem count={12} suffix="K+" label="Students" />
          <StatItem count={98} suffix="%" label="Satisfaction Rate" />
          <StatItem count={350} suffix="+" label="Institutions" />
          <StatItem count={40} suffix="%" label="Better Results" />
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="features__header">
            <p className="section-label">What We Offer</p>
            <h2 className="section-title">Built for modern education</h2>
            <p className="section-desc">Every feature is designed to reduce friction and amplify learning.</p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="features__header">
            <p className="section-label">The Process</p>
            <h2 className="section-title">Simple. Powerful. Fast.</h2>
            <p className="section-desc">Up and running in minutes, not months.</p>
          </div>
          <div className="steps">
            {steps.map((s) => (
              <div key={s.title} className="step">
                <div className="step__num" />
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section" id="about">
        <div className="container">
          <p className="section-label">Get Started Today</p>
          <h2 className="section-title">Ready to transform learning?</h2>
          <p className="section-desc">Join thousands of students and educators already on the platform.</p>
          <div className="hero__cta" style={{ marginTop: 40 }}>
            <button className="btn btn-primary" onClick={() => navigate("/auth")}>
              Create Free Account
            </button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__top">
            <div className="footer__brand">
              <button
                className="nav__logo"
                onClick={() => navigate("/")}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <div className="nav__logo-icon"><span>S</span></div>
                SkillWeave
              </button>
              <p>Reimagining education through intelligent technology solutions.</p>
            </div>
            <div className="footer__links-group">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-grey-200)", fontSize: 14, padding: 0 }} onClick={() => navigate("/auth")}>Dashboard</button></li>
              </ul>
            </div>
            <div className="footer__links-group">
              <h4>Account</h4>
              <ul>
                <li><button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-grey-200)", fontSize: 14, padding: 0 }} onClick={() => navigate("/auth")}>Login</button></li>
                <li><button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-grey-200)", fontSize: 14, padding: 0 }} onClick={() => navigate("/auth")}>Sign Up</button></li>
              </ul>
            </div>
            <div className="footer__links-group">
              <h4>Team</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© 2026 SkillWeave Solutions.</span>
            <span>Made with ♥ by the team Mugiwara</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
