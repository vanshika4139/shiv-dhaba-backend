import ForgotPassword from './ForgotPassword';
import { useState } from 'react';
import { useTheme, ThemeToggle } from './ThemeContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:1500';

// step: 'login' | 'forgot' | 'otp' | 'reset'
export default function Login({ onLogin }) {
  const { theme } = useTheme();

  // Login state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Forgot-password flow state
  const [step, setStep]             = useState('login'); // 'login' | 'forgot' | 'otp' | 'reset'
  const [fpEmail, setFpEmail]       = useState('');
  const [fpOtp, setFpOtp]           = useState('');
  const [fpNewPass, setFpNewPass]   = useState('');
  const [fpConfirm, setFpConfirm]   = useState('');
  const [fpShowPass, setFpShowPass] = useState(false);
  const [fpMsg, setFpMsg]           = useState('');
  const [fpError, setFpError]       = useState('');
  const [fpLoading, setFpLoading]   = useState(false);

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px',
    background: theme.bgInput,
    border: `1.5px solid ${theme.borderDim}`,
    borderRadius: 10,
    color: theme.text,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  // ── LOGIN ──────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError('Please enter both email and password'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
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

  // ── STEP 1: Send OTP ───────────────────────────────────
  const handleSendOtp = async () => {
    if (!fpEmail.trim()) { setFpError('Email daalna zaroori hai'); return; }
    setFpLoading(true); setFpError(''); setFpMsg('');
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.message || 'Email nahi mila'); setFpLoading(false); return; }
      setFpMsg('OTP bhej diya! Apna email check karo 📧');
      setStep('otp');
    } catch {
      setFpError('Server se connect nahi ho pa raha');
    }
    setFpLoading(false);
  };

  // ── STEP 2: Verify OTP & Reset ─────────────────────────
  const handleResetPassword = async () => {
    if (!fpOtp.trim()) { setFpError('OTP daalo'); return; }
    if (!fpNewPass.trim()) { setFpError('Naya password daalo'); return; }
    if (fpNewPass.length < 6) { setFpError('Password kam se kam 6 characters ka hona chahiye'); return; }
    if (fpNewPass !== fpConfirm) { setFpError('Passwords match nahi kar rahe'); return; }
    setFpLoading(true); setFpError(''); setFpMsg('');
    try {
      const res  = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail.trim(), otp: fpOtp.trim(), newPassword: fpNewPass }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.message || 'OTP galat hai ya expire ho gaya'); setFpLoading(false); return; }
      setStep('done');
    } catch {
      setFpError('Server se connect nahi ho pa raha');
    }
    setFpLoading(false);
  };

  const resetFpFlow = () => {
    setStep('login'); setFpEmail(''); setFpOtp('');
    setFpNewPass(''); setFpConfirm(''); setFpMsg(''); setFpError('');
  };

  // ── SHARED STYLES ──────────────────────────────────────
  const cardStyle = {
    width: '100%', maxWidth: 380,
    background: theme.bgCard,
    border: `1px solid ${theme.borderCard}`,
    borderRadius: 20, overflow: 'hidden',
    boxShadow: theme.shadow,
    transition: 'background 0.25s, border-color 0.25s',
  };
  const bannerStyle = {
    background: theme.bgHeader,
    padding: '32px 32px 24px', textAlign: 'center',
    borderBottom: `1px solid ${theme.border}`,
    transition: 'background 0.25s',
  };
  const msgBox = (type) => ({
    borderRadius: 8, padding: '10px 14px',
    fontSize: 13, marginBottom: 16,
    ...(type === 'error'
      ? { background: theme.errorBg, border: `1px solid ${theme.errorBorder}`, color: theme.errorText }
      : { background: '#052e16', border: '1px solid #166534', color: '#86efac' }
    ),
  });
  const primaryBtn = (disabled) => ({
    width: '100%', padding: '13px',
    background: disabled ? '#7c3d00' : theme.accent,
    border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 15, fontWeight: 800,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background 0.2s',
  });
  const ghostBtn = {
    background: 'none', border: 'none',
    color: theme.accent, fontSize: 13,
    cursor: 'pointer', fontWeight: 600,
    padding: 0, textDecoration: 'underline',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: 16,
      transition: 'background 0.25s',
    }}>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div style={cardStyle}>
        {/* Banner */}
        <div style={bannerStyle}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: theme.accent, letterSpacing: -0.5 }}>
            RESTRO
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.textSubtitle }}>
            {step === 'login'  && '& Restro — Admin Login'}
            {step === 'forgot' && 'Password Reset — Step 1'}
            {step === 'otp'    && 'Password Reset — Step 2'}
            {step === 'done'   && 'Password Reset — Done!'}
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>

          {/* ══════════ LOGIN FORM ══════════ */}
          {step === 'login' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  📧 Email Address
                </label>
                <input
                  type="email" placeholder="your@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.borderDim}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  🔒 Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.borderDim}
                  />
                  <button onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.6 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <button onClick={() => { setStep('forgot'); setFpEmail(email); setError(''); }} style={ghostBtn}>
                  🔑 Forgot Password?
                </button>
              </div>

              {error && <div style={msgBox('error')}>⚠️ {error}</div>}

              <button onClick={handleSubmit} disabled={loading} style={primaryBtn(loading)}>
                {loading ? '⏳ Logging in...' : '🚀 Login'}
              </button>
            </>
          )}

          {/* ══════════ STEP 1: Enter email → Send OTP ══════════ */}
          {step === 'forgot' && (
            <>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
                Apna registered email daalo. Hum aapko ek 6-digit OTP bhejenge. 📨
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  📧 Registered Email
                </label>
                <input
                  type="email" placeholder="your@email.com" value={fpEmail}
                  onChange={e => { setFpEmail(e.target.value); setFpError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.borderDim}
                />
              </div>

              {fpError && <div style={msgBox('error')}>⚠️ {fpError}</div>}
              {fpMsg   && <div style={msgBox('success')}>✅ {fpMsg}</div>}

              <button onClick={handleSendOtp} disabled={fpLoading} style={primaryBtn(fpLoading)}>
                {fpLoading ? '⏳ Bhej raha hoon...' : '📨 OTP Bhejo'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button onClick={resetFpFlow} style={ghostBtn}>← Login pe wapas jao</button>
              </div>
            </>
          )}

          {/* ══════════ STEP 2: Enter OTP + New Password ══════════ */}
          {step === 'otp' && (
            <>
              <div style={msgBox('success')}>
                ✅ OTP bhej diya <b>{fpEmail}</b> pe! Spam folder bhi check karo.
              </div>

              {/* OTP input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  🔢 6-Digit OTP
                </label>
                <input
                  type="text" placeholder="e.g. 482910" value={fpOtp}
                  maxLength={6}
                  onChange={e => { setFpOtp(e.target.value.replace(/\D/g, '')); setFpError(''); }}
                  style={{ ...inputStyle, letterSpacing: 6, fontSize: 20, textAlign: 'center', fontWeight: 700 }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.borderDim}
                />
              </div>

              {/* New Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  🔒 Naya Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={fpShowPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={fpNewPass}
                    onChange={e => { setFpNewPass(e.target.value); setFpError(''); }}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.borderDim}
                  />
                  <button onClick={() => setFpShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.6 }}>
                    {fpShowPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: theme.textLabel, marginBottom: 6 }}>
                  🔒 Password Confirm Karo
                </label>
                <input
                  type={fpShowPass ? 'text' : 'password'} placeholder="Dobara daalo" value={fpConfirm}
                  onChange={e => { setFpConfirm(e.target.value); setFpError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                  style={{
                    ...inputStyle,
                    borderColor: fpConfirm && fpNewPass !== fpConfirm ? '#ef4444' : theme.borderDim,
                  }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = fpConfirm && fpNewPass !== fpConfirm ? '#ef4444' : theme.borderDim}
                />
                {fpConfirm && fpNewPass !== fpConfirm && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Passwords match nahi kar rahe</p>
                )}
              </div>

              {fpError && <div style={msgBox('error')}>⚠️ {fpError}</div>}

              <button onClick={handleResetPassword} disabled={fpLoading} style={primaryBtn(fpLoading)}>
                {fpLoading ? '⏳ Reset ho raha hai...' : '✅ Password Reset Karo'}
              </button>

              {/* Resend OTP */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <button onClick={() => { setStep('forgot'); setFpOtp(''); setFpError(''); }} style={ghostBtn}>
                  🔄 OTP Resend Karo
                </button>
                <button onClick={resetFpFlow} style={{ ...ghostBtn, color: theme.textMuted, textDecoration: 'none' }}>
                  ← Wapas
                </button>
              </div>
            </>
          )}

          {/* ══════════ DONE ══════════ */}
          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#22c55e' }}>
                Password Reset Ho Gaya!
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
                Ab apne naye password se login karo.
              </p>
              <button onClick={resetFpFlow} style={primaryBtn(false)}>
                🚀 Login Karo
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}