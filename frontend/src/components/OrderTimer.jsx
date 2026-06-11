import { useState, useEffect } from 'react';

/**
 * OrderTimer — shows how long an order has been waiting.
 * 
 * Props:
 *   orderId  — the order's id (Date.now() timestamp in ms)
 *   status   — current order status string
 * 
 * Color coding:
 *   < 10 min  → green   (fresh)
 *   10–20 min → yellow  (warming up)
 *   > 20 min  → red     (overdue, pulses)
 *   Delivered → grey    (done, no pulse)
 */
export default function OrderTimer({ orderId, status }) {
  const [elapsed, setElapsed] = useState(0); // seconds

  useEffect(() => {
    const startTs = typeof orderId === 'number' && orderId > 1_000_000_000_000
      ? orderId          // Date.now() ms timestamp
      : Date.now();      // fallback

    const tick = () => setElapsed(Math.floor((Date.now() - startTs) / 1000));
    tick();

    if (status === 'Delivered') return; // no ticking for delivered orders

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [orderId, status]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const isDelivered = status === 'Delivered';
  const isOverdue   = mins >= 20 && !isDelivered;
  const isWarning   = mins >= 10 && mins < 20 && !isDelivered;

  const color = isDelivered ? '#6b7280'
              : isOverdue   ? '#ef4444'
              : isWarning   ? '#f59e0b'
              :               '#22c55e';

  const bgColor = isDelivered ? '#1f2937'
                : isOverdue   ? '#450a0a'
                : isWarning   ? '#451a03'
                :               '#052e16';

  const label = isDelivered
    ? `Done in ${mins}m ${secs}s`
    : mins === 0
      ? `${secs}s ago`
      : `${mins}m ${secs}s`;

  const icon = isDelivered ? '📦'
             : isOverdue   ? '🔴'
             : isWarning   ? '🟡'
             :               '🟢';

  return (
    <span
      title={`Order placed ${mins} min ${secs} sec ago`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: bgColor,
        color: color,
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 9px',
        borderRadius: 20,
        border: `1px solid ${color}44`,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
        animation: isOverdue ? 'timerPulse 1.5s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }}
    >
      {/* Inject pulse keyframe once */}
      <style>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
      `}</style>
      {icon} ⏱ {label}
    </span>
  );
}
