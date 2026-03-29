import React, { useState, useEffect, useRef, useCallback, type FC } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { ToastType } from "../../types";
import "./AuthPage.css";

/* ─── Props ────────────────────────────────────────────────── */
interface AuthPageProps {
  showToast: (msg: string, type?: ToastType) => void;
}

/* ─── Friendly error map (from login.js) ───────────────────── */
function friendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "That email is already registered. Please sign in.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/invalid-credential": "Invalid email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* ─── Google Icon SVG ──────────────────────────────────────── */
const GoogleIcon: FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ─── Starfield Canvas ─────────────────────────────────────── */
interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  speed: number;
  phase: number;
  drift: number;
}

const Starfield: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const stars: Star[] = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 0.85 + 0.18,
        a: Math.random() * 0.45 + 0.1,
        speed: Math.random() * 0.00011 + 0.000035,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.00008,
      });
    }

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width;
      const H = canvas.height;
      stars.forEach((s) => {
        s.x = (s.x + s.drift + 1) % 1;
        const alpha = s.a * (0.55 + 0.45 * Math.sin(ts * s.speed * 1000 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,218,248,${alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-starfield" />;
};

/* ══════════════════════════════════════════════════════════════
   AuthPage
   ══════════════════════════════════════════════════════════════ */
const AuthPage: FC<AuthPageProps> = ({ showToast }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Panel state
  const [rightPanelActive, setRightPanelActive] = useState(false);

  // Sign-in form state
  const [siEmail, setSiEmail] = useState("");
  const [siPwd, setSiPwd] = useState("");

  // Sign-up form state
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPwd, setSuPwd] = useState("");

  // Loading state for buttons
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  /* ─── Handlers (from login.js) ─────────────────────────── */
  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSignInLoading(true);
      try {
        await signInWithEmailAndPassword(auth, siEmail, siPwd);
        showToast("Welcome back! Redirecting…", "success");
        setTimeout(() => navigate("/dashboard"), 1000);
      } catch (err: any) {
        showToast(friendlyError(err.code), "error");
      } finally {
        setIsSignInLoading(false);
      }
    },
    [siEmail, siPwd, navigate, showToast]
  );

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!suName) {
        showToast("Please enter your full name.", "error");
        return;
      }
      if (suPwd.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
      }

      setIsSignUpLoading(true);
      try {
        const cred = await createUserWithEmailAndPassword(auth, suEmail, suPwd);
        const uid = cred.user.uid;

        await updateProfile(cred.user, { displayName: suName });

        await setDoc(doc(db, "users", uid), {
          uid,
          name: suName,
          email: suEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          photoURL: "",
          phone: "",
        });

        showToast("Account created! Redirecting…", "success");
        setTimeout(() => navigate("/dashboard"), 1200);
      } catch (err: any) {
        showToast(friendlyError(err.code), "error");
      } finally {
        setIsSignUpLoading(false);
      }
    },
    [suName, suEmail, suPwd, navigate, showToast]
  );

  const handleGoogleAuth = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const uid = user.uid;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid,
          name: user.displayName || "New User",
          email: user.email,
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          phone: "",
        });
      }

      showToast("Signed in with Google! Redirecting…", "success");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err: any) {
      showToast(friendlyError(err.code), "error");
    }
  }, [navigate, showToast]);

  const handleForgotPassword = useCallback(async () => {
    if (!siEmail) {
      showToast("Enter your email above first.", "error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, siEmail);
      showToast("Password reset email sent! Check your inbox.", "success");
    } catch (err: any) {
      showToast(friendlyError(err.code), "error");
    }
  }, [siEmail, showToast]);

  // Don't render while auth is still loading
  if (authLoading) return null;

  return (
    <div className="auth-page-root">
      {/* Starfield canvas */}
      <Starfield />

      {/* Ambient blobs */}
      <div className="glow-blob glow-blob-1" />
      <div className="glow-blob glow-blob-2" />
      <div className="glow-blob glow-blob-3" />

      {/* Back to landing */}
      <button className="auth-back-link" onClick={() => navigate("/")} type="button">
        <svg viewBox="0 0 14 14">
          <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        SkillWeave
      </button>

      {/* ── Auth Card ────────────────────────────────────── */}
      <div
        className={`auth-container${rightPanelActive ? " right-panel-active" : ""}`}
        id="auth-container"
      >
        {/* ── Sign In Form ─────────────────────────────── */}
        <div className="form-container sign-in-container">
          <form id="signin-form" autoComplete="off" onSubmit={handleSignIn}>
            <h1>Welcome Back</h1>
            <p className="form-sub">Where Skills Connect.</p>

            {/* Google SSO */}
            <div className="social-container">
              <button
                type="button"
                className="social-btn"
                id="google-signin"
                title="Continue with Google"
                aria-label="Sign in with Google"
                onClick={handleGoogleAuth}
              >
                <GoogleIcon />
              </button>
            </div>

            <div className="or-divider">
              <span>or sign in with email</span>
            </div>

            <div className="input-group">
              <input
                type="email"
                id="si-email"
                placeholder=" "
                required
                value={siEmail}
                onChange={(e) => setSiEmail(e.target.value)}
              />
              <label htmlFor="si-email">Email address</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="si-pwd"
                placeholder=" "
                required
                value={siPwd}
                onChange={(e) => setSiPwd(e.target.value)}
              />
              <label htmlFor="si-pwd">Password</label>
            </div>

            <button
              type="button"
              className="forgot-pass"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>

            <button
              type="submit"
              className="primary-btn"
              id="signin-btn"
              disabled={isSignInLoading}
            >
              {isSignInLoading ? "Please wait…" : "Access Platform"}
            </button>

            {/* Mobile toggle */}
            <div className="auth-mobile-toggle">
              New here?{" "}
              <button type="button" onClick={() => setRightPanelActive(true)}>
                Create Account
              </button>
            </div>
          </form>
        </div>

        {/* ── Sign Up Form ─────────────────────────────── */}
        <div className="form-container sign-up-container">
          <form id="signup-form" autoComplete="off" onSubmit={handleSignUp}>
            <h1>Create Account</h1>
            <p className="form-sub">Begin your SkillWeavw journey</p>

            {/* Google SSO */}
            <div className="social-container">
              <button
                type="button"
                className="social-btn"
                id="google-signup"
                title="Continue with Google"
                aria-label="Sign up with Google"
                onClick={handleGoogleAuth}
              >
                <GoogleIcon />
              </button>
            </div>

            <div className="or-divider">
              <span>or create with email</span>
            </div>

            <div className="input-group">
              <input
                type="text"
                id="su-name"
                placeholder=" "
                required
                value={suName}
                onChange={(e) => setSuName(e.target.value)}
              />
              <label htmlFor="su-name">Full name</label>
            </div>
            <div className="input-group">
              <input
                type="email"
                id="su-email"
                placeholder=" "
                required
                value={suEmail}
                onChange={(e) => setSuEmail(e.target.value)}
              />
              <label htmlFor="su-email">Email address</label>
            </div>
            <div className="input-group">
              <input
                type="password"
                id="su-pwd"
                placeholder=" "
                required
                minLength={6}
                value={suPwd}
                onChange={(e) => setSuPwd(e.target.value)}
              />
              <label htmlFor="su-pwd">Password (min 6 chars)</label>
            </div>

            <button
              type="submit"
              className="primary-btn"
              id="signup-btn"
              disabled={isSignUpLoading}
            >
              {isSignUpLoading ? "Please wait…" : "Create Account"}
            </button>

            {/* Mobile toggle */}
            <div className="auth-mobile-toggle">
              Already have an account?{" "}
              <button type="button" onClick={() => setRightPanelActive(false)}>
                Sign In
              </button>
            </div>
          </form>
        </div>

        {/* ── Sliding overlay panel ────────────────────── */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Decorative waves */}
            <svg
              className="overlay-waves"
              viewBox="0 0 800 200"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 160 Q100 120 200 145 Q300 170 400 135 Q500 100 600 125 Q700 150 800 110"
                stroke="rgba(122,178,224,0.35)"
                strokeWidth="1"
              />
              <path
                d="M0 175 Q110 140 220 160 Q340 180 460 148 Q580 116 700 140 Q760 153 800 130"
                stroke="rgba(94,203,200,0.25)"
                strokeWidth="0.8"
              />
              <path
                d="M0 190 Q120 160 250 175 Q380 190 500 162 Q620 134 750 158 Q780 165 800 152"
                stroke="rgba(155,127,232,0.18)"
                strokeWidth="0.6"
              />
            </svg>

            {/* Right panel: "New here? → Sign Up" */}
            <div className="overlay-panel overlay-right">
              <div className="brand">SkillWeave</div>
              <h1>
                Hello,
                <br />
                <em>Friend</em>
              </h1>
              <p>
                Where Your Skills Come Together
              </p>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => setRightPanelActive(true)}
              >
                Create Account
              </button>
            </div>

            {/* Left panel: "Already a member? → Sign In" */}
            <div className="overlay-panel overlay-left">
              <div className="brand">SkillWeave</div>
              <h1>
                Welcome
                <br />
                <em>Back</em>
              </h1>
              <p>
                Weave Your Knowledge
              </p>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => setRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
