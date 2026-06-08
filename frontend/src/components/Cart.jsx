import { useState } from "react";
import { useTheme } from "./ThemeContext";

const TABLES = [1,2,3,4,5,6,7,8,9,10,11,12];

const PAYMENT_MODES = [
  { id: 'cash',     icon: '💵', label: 'Cash on Delivery', hint: 'Pay when food arrives' },
  { id: 'upi',      icon: '📲', label: 'UPI',              hint: 'Pay via any UPI app' },
  { id: 'phonepay', icon: '📱', label: 'PhonePe',          hint: 'Pay via PhonePe app' },
];

export default function Cart({ cart, onUpdate, onClose, tableNumber, onTableChange, onOrderPlaced, t }) {
  const { theme } = useTheme();
  const [placing, setPlacing]           = useState(false);
  const [placed, setPlaced]             = useState(false);
  const [tableError, setTableError]     = useState(false);
  const [paymentMode, setPaymentMode]   = useState('');
  const [paymentError, setPaymentError] = useState(false);
  const [paymentDone, setPaymentDone]   = useState(false);

  const [isUrgent, setIsUrgent]         = useState(false);
  const [urgentReason, setUrgentReason] = useState('');

  const URGENT_REASONS = [
    { id: 'in_a_hurry',    icon: '⚡', label: 'In a hurry' },
    { id: 'medical_need',  icon: '🏥', label: 'Medical need' },
    { id: 'child_waiting', icon: '👶', label: 'Child waiting' },
    { id: 'flight_train',  icon: '✈️', label: 'Flight / Train to catch' },
    { id: 'other',         icon: '📝', label: 'Other reason' },
  ];

  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [customerErrors, setCustomerErrors] = useState({});

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateQty = (id, delta) => {
    onUpdate(prev =>
      prev.map(item => (item.id === id || item._id === id) ? { ...item, qty: item.qty + delta } : item)
          .filter(item => item.qty > 0)
    );
  };

  const validate = () => {
    let errors = {};
    let hasError = false;
    if (!tableNumber.trim()) { setTableError(true); hasError = true; }
    if (!paymentMode) { setPaymentError(true); hasError = true; }
    if (!customer.name.trim()) { errors.name = true; hasError = true; }
    if (!customer.phone.trim() || customer.phone.length < 10) { errors.phone = true; hasError = true; }
    setCustomerErrors(errors);
    return !hasError;
  };

  const handlePlaceOrder = async () => {
    if (!validate() || cart.length === 0) return;
    setPlacing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, note: i.note || '' })),
          total, paymentMode,
          paymentStatus: paymentDone ? 'Paid' : 'Unpaid',
          customer, urgent: isUrgent,
          urgentReason: isUrgent ? urgentReason : '',
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          status: "Pending"
        }),
      });
      const data = await res.json();
      setPlaced(true);
      setTimeout(() => { onUpdate([]); setPlaced(false); onOrderPlaced?.(data.order); onClose(); }, 2000);
    } catch { alert("Order could not be placed. Please check the server!"); }
    setPlacing(false);
  };

  const inputStyle = (hasError) => ({
    width: "100%", boxSizing: "border-box",
    padding: "10px 12px",
    background: theme.bgInput,
    border: `1.5px solid ${hasError ? "#f87171" : theme.borderInput}`,
    borderRadius: 8, color: theme.text, fontSize: 13, outline: "none",
    transition: "background 0.25s, border-color 0.2s",
  });

  const sectionBorder = `1px solid ${theme.border}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: theme.overlay, zIndex: 200, backdropFilter: "blur(2px)" }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0,
        width: "min(460px, 100vw)",
        background: theme.bgSidebar,
        borderLeft: sectionBorder,
        zIndex: 201, display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.3)",
        transition: "background 0.25s",
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: sectionBorder,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: theme.bgSidebar, zIndex: 10,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: theme.accent }}>🛒 Your Cart</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: theme.textMuted }}>
              {cart.length === 0 ? "Your cart is empty" : `${cart.reduce((s, i) => s + i.qty, 0)} items • ₹${total}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: theme.bgSection, border: "none", color: theme.text,
              width: 34, height: 34, borderRadius: "50%", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Customer Details */}
          <div style={{ padding: "14px 20px", borderBottom: sectionBorder }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: theme.text }}>👤 Your Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: theme.textLabel, display: "block", marginBottom: 4 }}>
                  Full Name {customerErrors.name && <span style={{ color: "#f87171" }}>← required</span>}
                </label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={customer.name}
                  onChange={e => { setCustomer({ ...customer, name: e.target.value }); setCustomerErrors({ ...customerErrors, name: false }); }}
                  style={inputStyle(customerErrors.name)}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = customerErrors.name ? "#f87171" : theme.borderInput} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: theme.textLabel, display: "block", marginBottom: 4 }}>
                  Phone Number {customerErrors.phone && <span style={{ color: "#f87171" }}>← required (10 digits)</span>}
                </label>
                <input type="tel" placeholder="e.g. 9876543210" value={customer.phone}
                  onChange={e => { setCustomer({ ...customer, phone: e.target.value.replace(/\D/, '') }); setCustomerErrors({ ...customerErrors, phone: false }); }}
                  maxLength={10}
                  style={inputStyle(customerErrors.phone)}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = customerErrors.phone ? "#f87171" : theme.borderInput} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: theme.textLabel, display: "block", marginBottom: 4 }}>Address (optional)</label>
                <input type="text" placeholder="e.g. Near Sai Mandir, Devla" value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.borderInput} />
              </div>
            </div>
          </div>

          {/* Table Selection */}
          <div style={{ padding: "14px 20px", borderBottom: sectionBorder }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: theme.text }}>
              🪑 Select Table {tableError && <span style={{ color: "#f87171", fontSize: 11, fontWeight: 400 }}>← required!</span>}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TABLES.map(n => (
                <button
                  key={n}
                  onClick={() => { onTableChange(String(n)); setTableError(false); }}
                  style={{
                    width: 40, height: 40, borderRadius: 8,
                    border: tableNumber === String(n) ? "none" : `1.5px solid ${tableError ? "#f87171" : theme.borderInput}`,
                    background: tableNumber === String(n) ? theme.accent : theme.bgSection,
                    color: tableNumber === String(n) ? "#fff" : theme.textMuted,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >{n}</button>
              ))}
              {/* Special options */}
              {[{ val: 'Outside', icon: '🌿', label: 'Outside' }, { val: 'Parcel', icon: '📦', label: 'Parcel' }].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => { onTableChange(opt.val); setTableError(false); }}
                  style={{
                    padding: "0 12px", height: 40, borderRadius: 8,
                    border: tableNumber === opt.val ? "none" : `1.5px solid ${tableError ? "#f87171" : theme.borderInput}`,
                    background: tableNumber === opt.val ? theme.accent : theme.bgSection,
                    color: tableNumber === opt.val ? "#fff" : theme.textMuted,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                >{opt.icon} {opt.label}</button>
              ))}
            </div>
          </div>

          {/* Urgent Toggle */}
          <div style={{ padding: "14px 20px", borderBottom: sectionBorder }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isUrgent ? 12 : 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: theme.text }}>🚨 Urgent Order?</h3>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: theme.textMuted }}>Priority preparation</p>
              </div>
              <button
                onClick={() => { setIsUrgent(u => !u); setUrgentReason(''); }}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: isUrgent ? "#ef4444" : theme.bgSection,
                  border: `1.5px solid ${isUrgent ? "#ef4444" : theme.borderInput}`,
                  cursor: "pointer", position: "relative", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 2,
                  left: isUrgent ? 22 : 2,
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
            {isUrgent && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {URGENT_REASONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setUrgentReason(r.id)}
                    style={{
                      padding: "5px 10px", borderRadius: 16, fontSize: 11,
                      border: urgentReason === r.id ? "1px solid #ef4444" : `1px solid ${theme.borderInput}`,
                      background: urgentReason === r.id ? "#2a0a0a" : theme.bgSection,
                      color: urgentReason === r.id ? "#f87171" : theme.textMuted,
                      cursor: "pointer",
                    }}
                  >{r.icon} {r.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <div style={{ padding: "14px 20px", borderBottom: sectionBorder }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: theme.text }}>
              💳 Payment Mode {paymentError && <span style={{ color: "#f87171", fontSize: 11, fontWeight: 400 }}>← required!</span>}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PAYMENT_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => { setPaymentMode(mode.id); setPaymentError(false); setPaymentDone(false); }}
                  style={{
                    padding: "10px 14px", borderRadius: 10, textAlign: "left",
                    border: paymentMode === mode.id
                      ? `1.5px solid ${theme.accent}`
                      : `1.5px solid ${paymentError ? "#f87171" : theme.borderInput}`,
                    background: paymentMode === mode.id ? theme.bgChipActive : theme.bgSection,
                    color: paymentMode === mode.id ? theme.accent : theme.textMuted,
                    cursor: "pointer", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{mode.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{mode.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{mode.hint}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* UPI confirm */}
            {(paymentMode === 'upi' || paymentMode === 'phonepay') && (
              <div style={{
                marginTop: 10, padding: "10px 14px",
                background: paymentDone ? "#052e16" : theme.bgInput,
                border: `1.5px solid ${paymentDone ? "#22c55e" : "#f59e0b"}`,
                borderRadius: 8,
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: paymentDone ? "#86efac" : "#fbbf24", fontWeight: 600 }}>
                  {paymentDone ? "✅ Payment confirmed!" : "⚠️ Complete UPI payment, then confirm:"}
                </p>
                {!paymentDone && (
                  <button
                    onClick={() => setPaymentDone(true)}
                    style={{
                      padding: "7px 16px", background: "#f59e0b", border: "none",
                      borderRadius: 7, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                  >✅ I've Paid via {paymentMode === 'phonepay' ? 'PhonePe' : 'UPI'}</button>
                )}
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div style={{ padding: "14px 20px" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: theme.textMuted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
                <p style={{ margin: 0, fontSize: 14 }}>Cart is empty</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.6 }}>Add items from the menu</p>
              </div>
            ) : cart.map(item => {
              const id = item.id || item._id;
              return (
                <div key={id} style={{
                  background: theme.bgSection,
                  border: `1px solid ${theme.borderInput}`,
                  borderRadius: 10, padding: "12px 14px", marginBottom: 10,
                  transition: "background 0.25s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: theme.text }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: theme.accent }}>₹{item.price} each</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateQty(id, -1)}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${theme.borderInput}`, background: theme.bgChip, color: theme.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, color: theme.text, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => updateQty(id, 1)}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: theme.accent, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                  </div>

                  {/* Instruction chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                    {['Extra spicy 🌶️', 'Less spicy', 'No onion', 'No garlic', 'Extra sauce', 'Less oil'].map(chip => {
                      const isActive = item.note === chip;
                      return (
                        <button key={chip}
                          onClick={() => onUpdate(prev => prev.map(i => (i.id || i._id) === id ? { ...i, note: isActive ? '' : chip } : i))}
                          style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 11,
                            border: isActive ? `1px solid ${theme.accent}` : `1px solid ${theme.borderCard}`,
                            background: isActive ? theme.bgChipActive : theme.bgChip,
                            color: isActive ? theme.accent : theme.textMuted,
                            cursor: "pointer", transition: "all 0.15s",
                          }}>{chip}</button>
                      );
                    })}
                  </div>

                  {/* Custom note */}
                  <div style={{ position: "relative" }}>
                    <input type="text" placeholder="Custom note..." value={item.note || ''} maxLength={60}
                      onChange={e => onUpdate(prev => prev.map(i => (i.id || i._id) === id ? { ...i, note: e.target.value } : i))}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "7px 32px 7px 10px",
                        background: theme.bgSurface,
                        border: `1px solid ${theme.borderCard}`,
                        borderRadius: 6, color: theme.text, fontSize: 12, outline: "none",
                        transition: "background 0.25s",
                      }}
                      onFocus={e => e.target.style.borderColor = theme.accent}
                      onBlur={e => e.target.style.borderColor = theme.borderCard}
                    />
                    {item.note && (
                      <button onClick={() => onUpdate(prev => prev.map(i => (i.id || i._id) === id ? { ...i, note: '' } : i))}
                        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                    )}
                  </div>
                  {item.note && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f59e0b" }}>📝 {item.note}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: "14px 20px 24px", borderTop: sectionBorder, background: theme.bgFooter, transition: "background 0.25s" }}>
            {cart.map(item => (
              <div key={item.id || item._id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted, marginBottom: 2 }}>
                <span>{item.name} × {item.qty}</span><span>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: sectionBorder, marginTop: 8, paddingTop: 8, fontSize: 16, fontWeight: 800, color: theme.text }}>
              <span>Total</span><span style={{ color: theme.accent }}>₹{total}</span>
            </div>

            {/* Summary */}
            <div style={{ background: theme.bgSummary, border: `1px solid ${theme.borderInput}`, borderRadius: 8, padding: "10px 14px", marginTop: 10, marginBottom: 12, transition: "background 0.25s" }}>
              {customer.name && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted, marginBottom: 3 }}><span>👤 Customer</span><span style={{ color: theme.text, fontWeight: 600 }}>{customer.name}</span></div>}
              {customer.phone && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted, marginBottom: 3 }}><span>📞 Phone</span><span style={{ color: theme.text }}>{customer.phone}</span></div>}
              {tableNumber && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted, marginBottom: 3 }}><span>🪑 Table</span><span style={{ color: theme.accent, fontWeight: 700 }}>{tableNumber}</span></div>}
              {isUrgent && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted, marginBottom: 3 }}><span>🚨 Priority</span><span style={{ color: "#f87171", fontWeight: 700 }}>URGENT{urgentReason ? ` — ${URGENT_REASONS.find(r => r.id === urgentReason)?.label}` : ''}</span></div>}
              {paymentMode && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: theme.textMuted }}><span>💳 Payment</span><span style={{ color: paymentDone ? "#86efac" : "#fbbf24", fontWeight: 700 }}>{PAYMENT_MODES.find(m => m.id === paymentMode)?.icon} {PAYMENT_MODES.find(m => m.id === paymentMode)?.label}{paymentMode !== 'cash' && <span style={{ marginLeft: 4 }}>{paymentDone ? "✅ Paid" : "⏳ Pending"}</span>}</span></div>}
            </div>

            {(paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone && (
              <div style={{ background: theme.bgChipActive, border: "1.5px solid #f59e0b", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <p style={{ margin: 0, fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>Complete UPI payment first, then confirm above before placing order!</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing || placed || ((paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone)}
              style={{
                width: "100%", padding: "14px",
                background: placed ? "#22c55e"
                  : (paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone ? theme.bgSurface
                  : theme.accent,
                border: (paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone ? `1.5px solid ${theme.borderAdmin}` : "none",
                borderRadius: 10, color: theme.text, fontSize: 16, fontWeight: 800,
                cursor: placing || placed || ((paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone) ? "not-allowed" : "pointer",
                opacity: (paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone ? 0.5 : 1,
                transition: "all 0.2s",
              }}
            >
              {placed ? "✅ Order Placed!"
                : placing ? "Placing order..."
                : (paymentMode === 'upi' || paymentMode === 'phonepay') && !paymentDone
                  ? "🔒 Confirm payment first"
                  : `🍛 Place Order — ₹${total}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}