import React, { useState, type FC } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import type { AuthTab, ToastType } from "../../types";
import "./AuthPage.css";

interface AuthPageProps {
  showToast: (msg: string, type?: ToastType) => void;
}

const GoogleIcon: FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.1c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.4-10.6 7.4-17.2z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.2 1.5-5 2.4-8 2.4-6.1 0-11.3-4.1-13.2-9.7H2.6v6.2C6.6 42.6 14.7 48 24 48z" />
    <path fill="#FBBC04" d="M10.8 28.9c-.5-1.5-.8-3.1-.8-4.9s.3-3.4.8-4.9v-6.2H2.6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.9l8.2-6z" />
    <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.3 30.5 0 24 0 14.7 0 6.6 5.4 2.6 13.1l8.2 6C12.7 13.6 17.9 9.5 24 9.5z" />
  </svg>
);

const AuthPage: FC<AuthPageProps> = ({ showToast }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPw, setLoginShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupRole, setSignupRole] = useState("");
  const [signupPw, setSignupPw] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupShowPw, setSignupShowPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      showToast("Signed in successfully!");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error: any) {
      console.error("Login Error:", error);
      showToast(error.message || "Failed to sign in.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPw) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (signupPw !== signupConfirm) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (!agreeTerms) {
      showToast("Please agree to the terms.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPw);
      if (signupName) {
        await updateProfile(userCredential.user, { displayName: signupName });
      }
      showToast("Account created successfully!");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error: any) {
      console.error("Signup Error:", error);
      showToast(error.message || "Failed to create account.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showToast("Signed in with Google!");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      showToast(error.message || "Google Sign-In failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel--left">
        <div className="auth-left__top">
          <button
            className="nav__logo"
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div className="nav__logo-icon"><span>S</span></div>
            Smart EdTech
          </button>
        </div>

        <div className="auth-left__content">
          <h2 className="auth-left__title">Learn Without<br />Limits</h2>
          <p className="auth-left__desc">
            Join our platform and unlock personalized learning, powerful
            assessments, and real-time insights — all in one place.
          </p>
          <div className="auth-testimonial">
            <p className="auth-testimonial__text">
              "This platform completely changed how I teach. My students are more
              engaged, and I have clarity on exactly where each one needs support."
            </p>
            <div className="auth-testimonial__author">
              <div className="auth-testimonial__avatar">P</div>
              <div>
                <div className="auth-testimonial__name">Priya Sharma</div>
                <div className="auth-testimonial__role">Senior Educator, Delhi</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--color-grey-400)" }}>
          © 2025 Smart EdTech Solutions
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel--right" style={{ position: "relative" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute", top: 24, left: 24,
            fontSize: 13, color: "var(--color-grey-400)",
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-white)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-grey-400)")}
        >
          ← Back to home
        </button>

        <div className="auth-form-wrap">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${activeTab === "login" ? " active" : ""}`}
              onClick={() => setActiveTab("login")}
            >Sign In</button>
            <button
              className={`auth-tab${activeTab === "signup" ? " active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >Sign Up</button>
          </div>

          {/* LOGIN */}
          {activeTab === "login" && (
            <div>
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>

              <button
                className="btn-oauth"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon /> Continue with Google
              </button>
              <div className="form-divider"><span>or sign in with email</span></div>

              <form onSubmit={handleLogin} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Email address</label>
                  <input
                    className="form-input"
                    type="email"
                    id="login-email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <div className="form-input-wrap">
                    <input
                      className="form-input"
                      type={loginShowPw ? "text" : "password"}
                      id="login-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <span
                      className="form-input-icon"
                      onClick={() => setLoginShowPw((s) => !s)}
                    >
                      {loginShowPw ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>

                <div className="form-row">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    /> Remember me
                  </label>
                  <a href="#" className="form-link">Forgot password?</a>
                </div>

                <button type="submit" className="btn btn-primary form-submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In →"}
                </button>
              </form>

              <div className="auth-switch">
                Don't have an account?{" "}
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-white)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3, fontSize: 13 }}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign up free
                </button>
              </div>
            </div>
          )}

          {/* SIGNUP */}
          {activeTab === "signup" && (
            <div>
              <h2>Create account</h2>
              <p>Join thousands of learners today</p>

              <button
                className="btn-oauth"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <GoogleIcon /> Sign up with Google
              </button>
              <div className="form-divider"><span>or sign up with email</span></div>

              <form onSubmit={handleSignup} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-name">Full name</label>
                  <input
                    className="form-input"
                    type="text"
                    id="signup-name"
                    placeholder="Ravi Kumar"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-email">Email address</label>
                  <input
                    className="form-input"
                    type="email"
                    id="signup-email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-role">I am a</label>
                  <select
                    className="form-input"
                    id="signup-role"
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                  >
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="educator">Educator / Teacher</option>
                    <option value="admin">Institution Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">Password</label>
                  <div className="form-input-wrap">
                    <input
                      className="form-input"
                      type={signupShowPw ? "text" : "password"}
                      id="signup-password"
                      placeholder="Min. 8 characters"
                      value={signupPw}
                      onChange={(e) => setSignupPw(e.target.value)}
                      required
                    />
                    <span
                      className="form-input-icon"
                      onClick={() => setSignupShowPw((s) => !s)}
                    >
                      {signupShowPw ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
                  <input
                    className="form-input"
                    type="password"
                    id="signup-confirm"
                    placeholder="••••••••"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    required
                  />
                </div>

                <label className="form-checkbox" style={{ marginBottom: 20 }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  I agree to the <a href="#" className="form-link">Terms of Service</a>
                </label>

                <button type="submit" className="btn btn-primary form-submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account →"}
                </button>
              </form>

              <div className="auth-switch">
                Already have an account?{" "}
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-white)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3, fontSize: 13 }}
                  onClick={() => setActiveTab("login")}
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
