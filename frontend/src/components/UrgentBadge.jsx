import { useState } from 'react';

/**
 * UrgentBadge — admin can toggle urgent flag on any order.
 *
 * Props:
 *   orderId  — order.id
 *   urgent   — boolean, current state
 *   token    — JWT token (admin)
 *   onToggle — callback(orderId, newUrgentValue) to update parent state
 */
export default function UrgentBadge({ orderId, urgent, token, onToggle }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order/${orderId}/urgent`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) onToggle(orderId, data.order.urgent);
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={urgent ? 'Click to remove urgent flag' : 'Mark as urgent'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 800,
        border: urgent ? '1.5px solid #ef4444' : '1.5px dashed #4b5563',
        background: urgent ? '#450a0a' : 'transparent',
        color: urgent ? '#f87171' : '#6b7280',
        cursor: loading ? 'default' : 'pointer',
        transition: 'all 0.18s',
        animation: urgent ? 'urgentPulse 1.8s ease-in-out infinite' : 'none',
        flexShrink: 0,
        letterSpacing: '0.03em',
      }}
    >
      <style>{`
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0.25); }
        }
      `}</style>
      {loading ? '⏳' : urgent ? '🚨 URGENT' : '⚑ Flag'}
    </button>
  );
}