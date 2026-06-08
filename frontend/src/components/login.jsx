import { useState } from 'react';
import { useTheme, ThemeToggle } from './ThemeContext';

export default function Login({ onLogin }) {
  const { theme } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // --- Forgot Password States ---
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep]     = useState(1); // 1: Send OTP, 2: Reset Password
  const [otp, setOtp]                   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [message, setMessage]           = useState('');

  // Live vs Local backend automation
  const API_BASE = window.location.origin.includes('localhost')
    ? 'http://localhost:1500'
    : 'https://shiv-restro-dhaba-backend.onrender.com';

  // --- Existing Login Logic ---
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password'); return;
    }
    setLoading(true); setError(''); setMessage('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      localStorage.setItem('dhaba_token', data.token);
      localStorage.setItem('dhaba_user', JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  // --- Step 1: Send OTP Logic ---
  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError('Please enter your email address'); return;
    }
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setMessage('OTP has been sent to your email!');
      setForgotStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // --- Step 2: Verify OTP & Change Password Logic ---
  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      setError('Please enter both OTP and your new password'); return;
    }
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP');
      
      alert('Password updated successfully! You can now login.');
      setIsForgotMode(false);
      setForgotStep(1);
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const inputStyle = () => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px',
    background: theme.bgInput,
    border: `1.5px solid ${theme.borderDim}`,
    borderRadius: 10,
    color: theme.text,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: 16,
      transition: 'background 0.25s',
    }}>
      {/* Theme toggle — top right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div style={{
        width: '100%', maxWidth: 380,
        background: theme.bgCard,
        border: `1px solid ${theme.borderCard}`,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: theme.shadow,
        transition: 'background 0.25s, border-color 0.25s',
      }}>
        {/* Banner */}
        <div style={{
          background: theme.bgHeader,
          padding: '32px 32px 24px', textAlign: 'center',
          borderBottom: `1px solid ${theme.border}`,
          transition: 'background 0.25s',
        }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>
            {isForgotMode ? '🔑' : '🍽️'}
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: theme.accent, letterSpacing: -0.5 }}>
            SHIV DHABA
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.textSubtitle }}>
            {isForgotMode ? '& Restro — Reset Password' : '& Restro — Admin Login'}
          </p>
        </div>

        {/* Dynamic Form Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          
          {/* Messages Alert UI */}
          {error && (
            <div style={{ background: theme.errorBg, border: `1px solid ${theme.errorBorder}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: theme.errorText, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}
          {message && (
            <div style={{ background: '#e6ffe6', border: `1px solid #b3ffb3`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'green', marginBottom: 16 }}>
              ✅ {message}
            </div>
          )}

          {!isForgotMode ? (
            /* ================= LOGIN INTERFACE ================= */
            <div>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  📧 Email Address
                </label>
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={inputStyle()}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.borderDim}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  🔒 Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ ...inputStyle(), paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.borderDim}
                  />
                  <button
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.6 }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Link Switcher to Forgot Form */}
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <span
                  onClick={() => { setIsForgotMode(true); setError(''); setMessage(''); }}
                  style={{ cursor: 'pointer', color: theme.accent, fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}
                >
                  Forgot Password?
                </span>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit} disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#7c3d00' : theme.accent,
                  border: 'none', borderRadius: 10,
                  color: '#fff', fontSize: 15, fontWeight: 800,
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? '⏳ Logging in...' : '🚀 Login'}
              </button>
            </div>
          ) : (
            /* ================= FORGOT INTERFACE ================= */
            <div>
              {forgotStep === 1 ? (
                /* STEP 1: Enter Email */
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                    Enter Registered Email
                  </label>
                  <input
                    type="email" placeholder="vanshika3926@gmail.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    style={inputStyle()}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.borderDim}
                  />
                  <button
                    onClick={handleSendOTP} disabled={loading}
                    style={{
                      width: '100%', padding: '13px', marginTop: 20,
                      background: theme.accent, border: 'none', borderRadius: 10,
                      color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    {loading ? '⏳ Sending OTP...' : '🔑 Send OTP Code'}
                  </button>
                </div>
              ) : (
                /* STEP 2: Verification Code & New Password Inputs */
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                      Enter 6-Digit OTP Key
                    </label>
                    <input
                      type="text" placeholder="123456" value={otp}
                      onChange={e => setOtp(e.target.value)}
                      style={inputStyle()}
                      onFocus={e => e.target.style.borderColor = theme.accent}
                      onBlur={e => e.target.style.borderColor = theme.borderDim}
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                      Setup New Secure Password
                    </label>
                    <input
                      type="password" placeholder="Min 6+ characters" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                      style={inputStyle()}
                      onFocus={e => e.target.style.borderColor = theme.accent}
                      onBlur={e => e.target.style.borderColor = theme.borderDim}
                    />
                  </div>
                  <button
                    onClick={handleResetPassword} disabled={loading}
                    style={{
                      width: '100%', padding: '13px',
                      background: '#2e7d32', border: 'none', borderRadius: 10,
                      color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    {loading ? '⏳ Updating...' : '✅ Save New Password'}
                  </button>
                </div>
              )}

              {/* Back to Login link */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <span
                  onClick={() => { setIsForgotMode(false); setForgotStep(1); setError(''); setMessage(''); }}
                  style={{ cursor: 'pointer', color: theme.textSubtitle, fontSize: 13, textDecoration: 'underline' }}
                >
                  ← Back to Login
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}