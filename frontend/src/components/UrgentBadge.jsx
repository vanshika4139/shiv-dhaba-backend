import API_BASE from '../api.js';
import { useState } from 'react';

/**
 * UrgentBadge — toggle urgent flag on an order
 * Props:
 *   orderId  — order _id
 *   urgent   — current urgent boolean
 *   token    — admin JWT
 *   onToggle — callback(orderId, newUrgent)
 */
export default function UrgentBadge({ orderId, urgent, token, onToggle }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/order/${orderId}/urgent`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        onToggle && onToggle(orderId, data.order.urgent);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={urgent ? 'Mark as Normal' : 'Mark as Urgent'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        cursor: loading ? 'wait' : 'pointer',
        border: urgent ? '1.5px solid #ef4444' : '1.5px solid #374151',
        background: urgent ? '#450a0a' : '#1f2937',
        color: urgent ? '#f87171' : '#9ca3af',
        transition: 'all 0.2s',
        animation: urgent ? 'urgentPulse 1.8s ease-in-out infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0.2); }
        }
      `}</style>
      {loading ? '⏳' : urgent ? '🚨 URGENT' : '🔔 Normal'}
    </button>
  );
}
