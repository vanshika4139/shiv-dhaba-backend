import { createContext, useContext, useState, useEffect } from 'react';

// ── Theme tokens ────────────────────────────────────────────────────────────
export const themes = {
  dark: {
    // Backgrounds
    bg:          '#0a0a0a',
    bgCard:      '#141414',
    bgSurface:   '#1e1e1e',
    bgHover:     '#181008',
    bgInput:     '#1e1008',
    bgHeader:    'linear-gradient(135deg, #1a0800, #2a1200)',
    bgFooter:    '#0f0700',
    bgSidebar:   '#140a00',
    bgSection:   '#1e1008',
    bgSummary:   '#1e1008',
    bgChip:      '#1e1008',
    bgChipActive:'#2a1000',
    bgAdminCard: '#1a1a1a',
    bgAdminInput:'#374151',

    // Borders
    border:      '#2a1500',
    borderCard:  '#2a1500',
    borderInput: '#3a1f00',
    borderActive:'#FF6B01',
    borderDim:   '#2a2a2a',
    borderAdmin: '#374151',

    // Text
    text:        '#f0ece4',
    textMuted:   '#a08060',
    textDim:     '#9ca3af',
    textLabel:   '#9ca3af',
    textSubtitle:'#a08060',
    textAdmin:   '#d1d5db',

    // Accent
    accent:      '#FF6B01',
    accentHover: '#e05a00',
    accentGold:  '#FFD700',

    // Shadows / overlays
    shadow:      '0 20px 60px rgba(0,0,0,0.6)',
    overlay:     'rgba(0,0,0,0.7)',
    headerShadow:'0 4px 24px rgba(0,0,0,0.5)',

    // Status
    errorBg:     '#2a0a0a',
    errorBorder: '#7f1d1d',
    errorText:   '#fca5a5',
  },

  light: {
    // Backgrounds
    bg:          '#faf6f0',
    bgCard:      '#ffffff',
    bgSurface:   '#f5f0e8',
    bgHover:     '#fff8f0',
    bgInput:     '#fff8f0',
    bgHeader:    'linear-gradient(135deg, #fff1e0, #ffe4c4)',
    bgFooter:    '#fff8f0',
    bgSidebar:   '#fffaf5',
    bgSection:   '#fff8f0',
    bgSummary:   '#fff8f0',
    bgChip:      '#f5ece0',
    bgChipActive:'#ffe4cc',
    bgAdminCard: '#f9f5ef',
    bgAdminInput:'#f0ece4',

    // Borders
    border:      '#f0d9be',
    borderCard:  '#e8d5b8',
    borderInput: '#e0c9a6',
    borderActive:'#FF6B01',
    borderDim:   '#e8e0d4',
    borderAdmin: '#d4c4ac',

    // Text
    text:        '#2a1a0a',
    textMuted:   '#8a6040',
    textDim:     '#6b5040',
    textLabel:   '#7a6050',
    textSubtitle:'#8a6040',
    textAdmin:   '#3a2a1a',

    // Accent
    accent:      '#FF6B01',
    accentHover: '#e05a00',
    accentGold:  '#c47a00',

    // Shadows / overlays
    shadow:      '0 20px 60px rgba(120,80,20,0.15)',
    overlay:     'rgba(0,0,0,0.4)',
    headerShadow:'0 4px 24px rgba(120,80,20,0.12)',

    // Status
    errorBg:     '#fff0f0',
    errorBorder: '#fca5a5',
    errorText:   '#991b1b',
  }
};

// ── Context ─────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('dhaba_theme') || 'dark';
  });

  const toggleTheme = () =>
    setMode(m => {
      const next = m === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dhaba_theme', next);
      return next;
    });

  const theme = themes[mode];

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

// ── Toggle Button Component ──────────────────────────────────────────────────
export function ThemeToggle({ style = {} }) {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 20,
        border: `1.5px solid ${isDark ? '#3a1f00' : '#e0c9a6'}`,
        background: isDark ? '#1e1008' : '#fff8f0',
        color: isDark ? '#a08060' : '#8a6040',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#FF6B01';
        e.currentTarget.style.color = '#FF6B01';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isDark ? '#3a1f00' : '#e0c9a6';
        e.currentTarget.style.color = isDark ? '#a08060' : '#8a6040';
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}