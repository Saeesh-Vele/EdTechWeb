import React, { type FC } from "react";
import type { Page, ToastType } from "../../types";
import Nav from "../../components/Nav/Nav";
import HeroCanvas from "../../components/HeroCanvas/HeroCanvas";
import StatItem from "../../components/StatItem/StatItem";
import "./LandingPage.css";

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  showToast: (msg: string, type?: ToastType) => void;
}

const features = [
  { icon: "🧠", title: "Adaptive Learning",     desc: "Personalized learning paths that adapt in real time to each student's pace, strengths, and knowledge gaps." },
  { icon: "📊", title: "Progress Analytics",    desc: "Actionable dashboards for students, teachers, and administrators with instant insights and performance trends." },
  { icon: "✅", title: "Smart Assessment",      desc: "Auto-graded quizzes, assignments, and open-ended responses with AI-powered feedback loops." },
  { icon: "🤝", title: "Collaborative Tools",   desc: "Live classes, group projects, and peer reviews that bring students together — anywhere, anytime." },
  { icon: "🔒", title: "Secure & Compliant",    desc: "Enterprise-grade security, data privacy, and compliance baked in from day one." },
  { icon: "📱", title: "Mobile First",           desc: "A seamless experience on any device — phone, tablet, or desktop — with offline capability." },
];

const steps = [
  { title: "Sign Up",            desc: "Create your account as a student, educator, or admin in seconds." },
  { title: "Set Up Your Space",  desc: "Add courses, invite students, and configure your learning environment." },
  { title: "Learn & Assess",     desc: "Deliver lessons, run assessments, and track progress in real time." },
  { title: "Improve",            desc: "Use data-driven insights to refine teaching and boost outcomes." },
];

const LandingPage: FC<LandingPageProps> = ({ onNavigate }) => (
  <div className="landing-page">
    <Nav onNavigate={onNavigate} />

    <HeroCanvas />

    {/* Stats bar */}
    <div className="stats-bar">
      <div className="stats-bar__inner container">
        <StatItem count={12}  suffix="K+" label="Students" />
        <StatItem count={98}  suffix="%"  label="Satisfaction Rate" />
        <StatItem count={350} suffix="+"  label="Institutions" />
        <StatItem count={40}  suffix="%"  label="Better Results" />
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
          <button className="btn btn-primary" onClick={() => onNavigate("auth")}>
            Create Free Account
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate("dashboard")}>
            View Dashboard Demo
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
              onClick={() => onNavigate("landing")}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div className="nav__logo-icon"><span>S</span></div>
              Smart EdTech
            </button>
            <p>Reimagining education through intelligent technology solutions.</p>
          </div>
          <div className="footer__links-group">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><button style={{ background:"none",border:"none",cursor:"pointer",color:"var(--color-grey-200)",fontSize:14,padding:0 }} onClick={() => onNavigate("dashboard")}>Dashboard</button></li>
            </ul>
          </div>
          <div className="footer__links-group">
            <h4>Account</h4>
            <ul>
              <li><button style={{ background:"none",border:"none",cursor:"pointer",color:"var(--color-grey-200)",fontSize:14,padding:0 }} onClick={() => onNavigate("auth")}>Login</button></li>
              <li><button style={{ background:"none",border:"none",cursor:"pointer",color:"var(--color-grey-200)",fontSize:14,padding:0 }} onClick={() => onNavigate("auth")}>Sign Up</button></li>
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
          <span>© 2025 Smart EdTech Solutions. Built for the Hackathon.</span>
          <span>Made with ♥ by the team</span>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
