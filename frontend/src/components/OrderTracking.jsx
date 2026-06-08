const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1500';
import { useState, useEffect, useRef } from "react";

const STATUS_FLOW = ["Pending", "Preparing", "Ready", "Delivered"];

const STATUS_INFO = {
  Pending:   { icon: "🕐", color: "#f59e0b", label: "Order Received",   desc: "Your order has been placed and is awaiting confirmation." },
  Preparing: { icon: "👨‍🍳", color: "#3b82f6", label: "Being Prepared",   desc: "Our chef is cooking your food with love!" },
  Ready:     { icon: "✅", color: "#22c55e", label: "Ready to Serve",    desc: "Your order is ready! It'll be at your table shortly." },
  Delivered: { icon: "🎉", color: "#FF6B01", label: "Delivered!",        desc: "Enjoy your meal! We hope you love it 😊" },
};

export default function OrderTracking({ orderId, onClose, onDelivered }) {
  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [prevStatus, setPrevStatus] = useState(null);
  const [pulse, setPulse]           = useState(false);
  const pollRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/order/${orderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(prev => {
        if (prev && prev.status !== data.status) {
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
          if (data.status === "Delivered" && onDelivered) {
            setTimeout(() => onDelivered(data), 1200);
          }
        }
        setPrevStatus(prev?.status || null);
        return data;
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
    pollRef.current = setInterval(fetchOrder, 6000); // poll every 6s
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  const ci = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, backdropFilter: "blur(4px)" }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(520px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        background: "#120800", border: "1px solid #3a1f00",
        borderRadius: 20, zIndex: 301,
        boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        fontFamily: "'Segoe UI', sans-serif", color: "#f0ece4",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a0a00, #2a1200)",
          padding: "22px 24px 18px",
          borderBottom: "1px solid #2a1500",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FF6B01" }}>
              📦 Order Tracking
            </h2>
            {order && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#a08060" }}>
                Order #{String(order._id || order.id || orderId).slice(-6).toUpperCase()}
                {order.customer?.name && ` • ${order.customer.name}`}
                {order.tableNumber && ` • Table ${order.tableNumber}`}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: "#2a1500", border: "none", color: "#f0ece4",
            width: 32, height: 32, borderRadius: "50%", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        <div style={{ padding: "24px 24px 28px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#a08060" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🍛</div>
              <p>Fetching your order...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#f87171" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
              <p>{error}</p>
              <button onClick={fetchOrder} style={{
                marginTop: 12, padding: "8px 20px", background: "#FF6B01",
                border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 700
              }}>Retry</button>
            </div>
          ) : order ? (
            <>
              {/* Status Hero */}
              <div style={{
                textAlign: "center", marginBottom: 28, padding: "20px 16px",
                background: "#1a1000", borderRadius: 14,
                border: `1.5px solid ${STATUS_INFO[order.status]?.color}44`,
                transition: "border-color 0.5s",
                animation: pulse ? "statusPulse 0.8s ease" : "none"
              }}>
                <style>{`@keyframes statusPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }`}</style>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{STATUS_INFO[order.status]?.icon}</div>
                <h3 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: STATUS_INFO[order.status]?.color }}>
                  {STATUS_INFO[order.status]?.label}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#a08060" }}>{STATUS_INFO[order.status]?.desc}</p>
              </div>

              {/* Progress Stepper */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, gap: 0 }}>
                {STATUS_FLOW.map((s, idx) => {
                  const done   = idx <= ci;
                  const active = idx === ci;
                  const info   = STATUS_INFO[s];
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: done ? info.color : "#1e1008",
                          border: `2px solid ${done ? info.color : "#3a1f00"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: active ? 20 : 16,
                          transition: "all 0.5s",
                          boxShadow: active ? `0 0 16px ${info.color}88` : "none",
                          transform: active ? "scale(1.15)" : "scale(1)"
                        }}>
                          {done ? (idx < ci ? "✓" : info.icon) : <span style={{ opacity: 0.3 }}>○</span>}
                        </div>
                        <span style={{ fontSize: 10, color: done ? info.color : "#604030", fontWeight: active ? 700 : 400, whiteSpace: "nowrap", textAlign: "center", maxWidth: 60 }}>
                          {s}
                        </span>
                      </div>
                      {idx < STATUS_FLOW.length - 1 && (
                        <div style={{
                          width: 32, height: 2, marginBottom: 18,
                          background: idx < ci ? "#FF6B01" : "#2a1500",
                          transition: "background 0.5s"
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#a08060", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Your Items
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", background: "#1a1000",
                      border: "1px solid #2a1500", borderRadius: 10
                    }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#f0ece4" }}>{item.name}</span>
                        {item.note && <span style={{ fontSize: 11, color: "#f59e0b", marginLeft: 8 }}>📝 {item.note}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, color: "#a08060" }}>×{item.qty}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B01" }}>₹{item.price * item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ background: "#1a1000", border: "1px solid #2a1500", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#a08060" }}>🕐 Ordered at</span>
                  <span style={{ fontSize: 12, color: "#f0ece4" }}>{order.time || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#a08060" }}>💳 Payment</span>
                  <span style={{ fontSize: 12, color: order.paymentStatus === "Paid" ? "#22c55e" : "#fbbf24", fontWeight: 600 }}>
                    {order.paymentMode} • {order.paymentStatus}
                  </span>
                </div>
                {order.urgent && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#a08060" }}>🚨 Priority</span>
                    <span style={{ fontSize: 12, color: "#f87171", fontWeight: 700 }}>URGENT</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2a1500", paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#f0ece4" }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#FF6B01" }}>₹{order.total}</span>
                </div>
              </div>

              {/* Auto-refresh note */}
              <p style={{ margin: "14px 0 0", fontSize: 11, color: "#604030", textAlign: "center" }}>
                🔄 Status updates automatically every 6 seconds
              </p>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}