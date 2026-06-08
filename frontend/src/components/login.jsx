import { useState } from 'react';
import { useTheme, ThemeToggle } from './ThemeContext';

export default function Login({ onLogin }) {
  const { theme } = useTheme();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password'); return;
    }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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

  const inputStyle = (focused) => ({
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
          <div style={{ fontSize: 44, marginBottom: 8 }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: theme.accent, letterSpacing: -0.5 }}>
            SHIV DHABA
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.textSubtitle }}>
            & Restro — Admin Login
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '28px 32px 32px' }}>
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
          <div style={{ marginBottom: 20 }}>
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

          {/* Error */}
          {error && (
            <div style={{
              background: theme.errorBg,
              border: `1px solid ${theme.errorBorder}`,
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: theme.errorText, marginBottom: 16,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
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
      </div>
    </div>
  );
}