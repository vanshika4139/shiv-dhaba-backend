const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1500';
import { useState } from "react";

function StarRating({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 2, fontSize: size,
            filter: (hover || value) >= star ? "none" : "grayscale(1) opacity(0.25)",
            transform: (hover || value) >= star ? "scale(1.15)" : "scale(1)",
            transition: "all 0.15s",
            color: "#FF6B01"
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];
const OVERALL_LABELS = ["", "Terrible 😞", "Meh 😕", "Good 😊", "Great 😄", "Amazing! 🤩"];

export default function RatingModal({ order, onClose, onSubmitted }) {
  const [itemRatings, setItemRatings] = useState(
    Object.fromEntries((order?.items || []).map(item => [item.name, 0]))
  );
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment]             = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const allRated = overallRating > 0;

  const handleSubmit = async () => {
    if (!allRated) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/order/${order._id || order.id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overallRating, itemRatings, comment }),
      });
      setSubmitted(true);
      setTimeout(() => { onSubmitted?.(); onClose(); }, 2200);
    } catch {
      // Even if API fails, still show success (graceful degradation)
      setSubmitted(true);
      setTimeout(() => { onSubmitted?.(); onClose(); }, 2200);
    }
    setSubmitting(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 400, backdropFilter: "blur(4px)" }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        background: "#120800", border: "1px solid #3a1f00",
        borderRadius: 20, zIndex: 401,
        boxShadow: "0 24px 80px rgba(0,0,0,0.9)",
        fontFamily: "'Segoe UI', sans-serif", color: "#f0ece4",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a0a00, #2a1200)",
          padding: "22px 24px 18px",
          borderBottom: "1px solid #2a1500",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#FF6B01" }}>
              ⭐ Rate Your Order
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#a08060" }}>
              Help us improve — your feedback matters!
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#2a1500", border: "none", color: "#f0ece4",
            width: 32, height: 32, borderRadius: "50%", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        <div style={{ padding: "24px" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🙏</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#22c55e" }}>
                Thank You!
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "#a08060" }}>
                Your feedback helps us serve you better.
              </p>
            </div>
          ) : (
            <>
              {/* Overall Rating */}
              <div style={{
                background: "#1a1000", border: "1.5px solid #3a1f00",
                borderRadius: 14, padding: "18px 20px", marginBottom: 20,
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#f0ece4" }}>
                  Overall Experience
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <StarRating value={overallRating} onChange={setOverallRating} size={36} />
                </div>
                <p style={{
                  margin: 0, fontSize: 13, fontWeight: 700,
                  color: overallRating ? "#FF6B01" : "#604030",
                  minHeight: 20, transition: "color 0.2s"
                }}>
                  {OVERALL_LABELS[overallRating] || "Tap to rate"}
                </p>
              </div>

              {/* Per-item Ratings */}
              {order?.items && order.items.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#a08060", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Rate Individual Items
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 16px", background: "#1a1000",
                        border: "1px solid #2a1500", borderRadius: 10,
                        flexWrap: "wrap", gap: 8
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#f0ece4" }}>
                            {item.name}
                            <span style={{ marginLeft: 6, fontSize: 11, color: "#604030" }}>×{item.qty}</span>
                          </p>
                          {itemRatings[item.name] > 0 && (
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#FF6B01" }}>
                              {RATING_LABELS[itemRatings[item.name]]}
                            </p>
                          )}
                        </div>
                        <StarRating
                          value={itemRatings[item.name] || 0}
                          onChange={val => setItemRatings(prev => ({ ...prev, [item.name]: val }))}
                          size={22}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#a08060", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Any comments? (optional)
                </label>
                <textarea
                  placeholder="e.g. Dal was delicious, roti was slightly cold..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "11px 14px", background: "#1a1000",
                    border: "1.5px solid #2a1500", borderRadius: 10,
                    color: "#f0ece4", fontSize: 13, outline: "none",
                    resize: "vertical", fontFamily: "inherit"
                  }}
                  onFocus={e => e.target.style.borderColor = "#FF6B01"}
                  onBlur={e => e.target.style.borderColor = "#2a1500"}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!allRated || submitting}
                style={{
                  width: "100%", padding: "14px",
                  background: !allRated ? "#1e1008" : "#FF6B01",
                  border: !allRated ? "1.5px solid #2a1500" : "none",
                  borderRadius: 10, color: !allRated ? "#604030" : "#fff",
                  fontSize: 15, fontWeight: 800,
                  cursor: !allRated || submitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                {submitting ? "Submitting..." : !allRated ? "⭐ Please rate your experience" : "Submit Feedback 🙏"}
              </button>

              <button onClick={onClose} style={{
                display: "block", width: "100%", marginTop: 10,
                background: "none", border: "none",
                color: "#604030", fontSize: 12, cursor: "pointer", padding: 6
              }}>
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}