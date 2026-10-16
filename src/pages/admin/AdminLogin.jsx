import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, LogIn, X, CheckCircle } from 'lucide-react';
import api from '../../api';
import { ADMIN_ROUTE_BASE } from '../../constants/admin';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const [email, setEmail] = useState('bitxhift@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="admin-theme relative min-h-screen w-full flex items-center justify-center bg-[#F7F7F7] p-4 text-[#111111]">
      {/* Centered Enterprise Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white p-8 md:p-10 border border-[#E5E5E5] shadow-sm">
          <div className="text-center mb-8 flex flex-col items-center">
            <Logo variant="stacked" isLightBackground={true} height={50} className="mb-4" />
            <div className="font-mono text-[11px] text-[#111111] uppercase tracking-widest mt-2 border border-[#E5E5E5] px-3.5 py-1.5 bg-[#F7F7F7] font-semibold">
              ADMIN CONTROL ROOM — SECURE LOGIN
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#F7F7F7] border border-[#111111] text-[#111111] font-mono text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#111111]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="field">
              <label htmlFor="email" className="block text-xs font-mono uppercase text-[#333333] mb-1.5 text-left font-semibold tracking-wider">
                Admin Email / Username
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none z-10" strokeWidth={1.5} />
                <input
                  type="email"
                  id="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-login-input"
                  placeholder="bitxhift@gmail.com"
                />
              </div>
            </div>

            <div className="field">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-mono uppercase text-[#333333] font-semibold tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(true);
                    setForgotSent(false);
                    setForgotEmail(email);
                  }}
                  className="font-mono text-[11px] text-[#666666] hover:text-[#111111] hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none z-10" strokeWidth={1.5} />
                <input
                  type="password"
                  id="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-login-input"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-login-submit-btn mt-6"
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

          <div className="mt-6 pt-4 border-t border-[#E5E5E5] text-center font-mono text-[10px] text-[#888888]">
            CENTRAL AUTHENTICATION — SECURE TOKEN &amp; PERSISTENT API
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white border border-[#E5E5E5] p-6 max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <span className="font-mono text-sm font-bold text-[#111111] uppercase tracking-wider">
                ADMIN PASSWORD RECOVERY
              </span>
              <button onClick={() => setForgotModal(false)} className="text-[#666666] hover:text-[#111111]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSent ? (
              <div className="my-6 text-center space-y-3 font-mono">
                <CheckCircle className="w-12 h-12 text-[#111111] mx-auto" />
                <div className="text-sm text-[#111111] font-bold">RECOVERY DISPATCHED</div>
                <p className="text-xs text-[#555555]">
                  A password reset authorization token has been logged to the system activity stream.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotModal(false)}
                  className="admin-btn-primary text-xs w-full mt-4"
                >
                  RETURN TO LOGIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="my-4 space-y-4 font-mono">
                <p className="text-xs text-[#555555]">
                  Enter your registered Admin email address to request a secure password reset token:
                </p>

                <div>
                  <label className="block text-[11px] uppercase text-[#333333] mb-1 font-semibold">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="admin-login-input !pl-3"
                    placeholder="admin@smrikaam.com"
                  />
                </div>

                <div className="border-t border-[#E5E5E5] pt-3 flex items-center justify-between">
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
                    className="admin-btn-primary text-xs"
                  >
                    {forgotLoading ? 'SENDING...' : 'DISPATCH RESET'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
