import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, LogIn, Key, X, CheckCircle } from 'lucide-react';
import api from '../../api';
import { ADMIN_ROUTE_BASE } from './AdminLayout';
import BlueprintWrapper from '../../components/BlueprintWrapper';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smrikaam.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Ambient Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0b0e14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79, 209, 197, ${1 - (dist / 140) * 0.6})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4fd1c5';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.token) {
        localStorage.setItem('smrikaam_admin_token', res.data.token);
      }
      const destination = location.state?.from?.pathname || `${ADMIN_ROUTE_BASE}/dashboard`;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or login rate-limited.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      alert('Failed to process password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="admin-theme relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#0b0e14] p-4 text-[#f4f4f4]">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Centered Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <BlueprintWrapper dark className="bg-[#141924]/95 backdrop-blur-xl p-8 md:p-10 border border-[rgba(255,255,255,0.2)] shadow-2xl">
          <div className="text-center mb-8 flex flex-col items-center">
            <Logo variant="stacked" dark height={46} className="mb-4" />
            <div className="font-mono text-[11px] text-[#4fd1c5] uppercase tracking-widest mt-2 border border-[#4fd1c5]/30 px-3 py-1 bg-[#1c2333]">
              ADMIN CONTROL ROOM — SECURE LOGIN
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-950/80 border border-rose-500 text-rose-200 font-mono text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="field">
              <label htmlFor="email" className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5 text-left">
                Admin Email / Username
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b5] pointer-events-none" strokeWidth={1.5} />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-10 pr-4 py-2.5 bg-[#1c2333] border border-[rgba(255,255,255,0.2)] text-[#f4f4f4] placeholder-[#64748b] focus:border-[#4fd1c5] focus:outline-none transition-colors"
                  placeholder="admin@smrikaam.com"
                />
              </div>
            </div>

            <div className="field">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-mono uppercase text-[#9aa3b5]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(true);
                    setForgotSent(false);
                    setForgotEmail(email);
                  }}
                  className="font-mono text-[11px] text-[#4fd1c5] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b5] pointer-events-none" strokeWidth={1.5} />
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-10 pr-4 py-2.5 bg-[#1c2333] border border-[rgba(255,255,255,0.2)] text-[#f4f4f4] placeholder-[#64748b] focus:border-[#4fd1c5] focus:outline-none transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm py-3 font-bold tracking-wider uppercase mt-6"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>AUTHENTICATE SESSION</span>
                  <LogIn className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.12)] text-center font-mono text-[10px] text-[#9aa3b5]">
            CENTRAL AUTHENTICATION — BCRYPT COST 10 &amp; PERSISTENT API
          </div>
        </BlueprintWrapper>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="dialog-backdrop">
          <BlueprintWrapper dark className="dialog admin-dialog max-w-md">
            <div className="dialog-title flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-3">
              <span className="font-heading text-lg text-[#f4f4f4] uppercase">
                ADMIN PASSWORD RECOVERY
              </span>
              <button onClick={() => setForgotModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="my-6 text-center space-y-3 font-mono">
                <CheckCircle className="w-12 h-12 text-[#4fd1c5] mx-auto" />
                <div className="text-sm text-emerald-300 font-bold">RECOVERY DISPATCHED</div>
                <p className="text-xs text-gray-300">
                  A password reset authorization token has been logged to the system activity stream.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModal(false)}
                  className="btn btn-primary text-xs w-full mt-4"
                >
                  RETURN TO LOGIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="my-4 space-y-4 font-mono">
                <p className="text-xs text-gray-300">
                  Enter your registered Admin email address to request a secure password reset token:
                </p>

                <div>
                  <label className="block text-[11px] uppercase text-[#9aa3b5] mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-white text-xs"
                    placeholder="admin@smrikaam.com"
                  />
                </div>

                <div className="dialog-actions border-t border-[rgba(255,255,255,0.15)] pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="admin-btn text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn btn-primary text-xs"
                  >
                    {forgotLoading ? 'SENDING...' : 'DISPATCH RESET'}
                  </button>
                </div>
              </form>
            )}
          </BlueprintWrapper>
        </div>
      )}
    </div>
  );
}
