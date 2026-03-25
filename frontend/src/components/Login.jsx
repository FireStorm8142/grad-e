import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import gsap from "gsap";

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const blurBgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!blurBgRef.current) return;

      const x = e.clientX;
      const y = e.clientY;

      // Animate the blur background to follow the cursor
      gsap.to(blurBgRef.current, {
        x: x - 150, // Center the blur blob
        y: y - 150,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 overflow-hidden font-sans"
    >
      {/* Cursor-following blur background */}
      <div
        ref={blurBgRef}
        className="fixed w-80 h-80 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      ></div>

      {/* Main content */}
      <div className="relative z-20 w-full flex items-center justify-center px-5">
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-lg border-2 border-blue-500 rounded-2xl p-16 shadow-2xl text-center animate-slidein">
          {/* Header */}
          <div className="mb-6">
            <div className="text-6xl mb-4 inline-block">📚</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Grade-E
            </h1>
            <p className="text-xs tracking-widest text-gray-500 font-semibold uppercase">
              YOUR AI GRADING ASSISTANT
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 text-gray-600 text-sm leading-relaxed">
            <p>
              Access your personalized grading dashboard and streamline your academic
              workflow.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-50 text-red-600 px-3 py-3 rounded-lg text-sm border-l-4 border-red-600">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 active:shadow-lg mb-6 relative overflow-hidden group"
          >
            <span className="absolute left-0 top-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-300"></span>
            <svg
              className="flex-shrink-0 w-5 h-5 relative z-10"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="relative z-10">
              {loading ? "Signing in..." : "Sign in with Google"}
            </span>
          </button>

          {/* Security Note */}
          <div className="text-xs tracking-wider text-gray-400 font-semibold uppercase pt-4 border-t border-gray-200">
            SECURE GATEWAY
          </div>
        </div>
      </div>

      {/* Add animation keyframes via style tag */}
      <style>{`
        @keyframes slidein {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slidein {
          animation: slidein 0.6s ease-out;
        }
        @media (max-width: 480px) {
          .animate-slidein {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
