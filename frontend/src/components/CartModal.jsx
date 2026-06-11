import React from 'react';
import { useTheme } from './ThemeContext';

function CartModal({ isOpen, onClose, cartCount }) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  const dummyPricePerItem = 180;
  const totalBill = cartCount * dummyPricePerItem;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: theme.overlay,
      zIndex: 50,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Slider */}
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 448,
        background: theme.bgAdminCard,
        height: '100%',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.3)',
        padding: 24,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderLeft: `1px solid ${theme.borderAdmin}`,
        color: theme.text,
        zIndex: 10,
        transition: 'background 0.25s',
      }}>
        {/* Top */}
        <div>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: `1px solid ${theme.borderAdmin}`,
            paddingBottom: 16, marginBottom: 24,
          }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: theme.accentGold, letterSpacing: 1 }}>
              YOUR CART 🛒
            </h2>
            <button
              onClick={onClose}
              style={{
                color: theme.textDim,
                background: theme.bgSurface,
                padding: '6px 12px',
                borderRadius: 20,
                border: `1px solid ${theme.borderAdmin}`,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = theme.text}
              onMouseLeave={e => e.currentTarget.style.color = theme.textDim}
            >
              ✕ Close
            </button>
          </div>

          {/* Items */}
          {cartCount === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80, color: theme.textMuted }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🍽️</span>
              <p style={{ fontStyle: 'italic', margin: 0 }}>Aapka cart khali hai bhai...</p>
              <p style={{ fontSize: 12, marginTop: 4, color: theme.textDim }}>Menu se kuch swadist add kijiye!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: theme.bgSurface,
                padding: 16, borderRadius: 12,
                border: `1px solid ${theme.borderAdmin}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontWeight: 700, color: theme.accent }}>Delicious Dhaba Items</h4>
                  <p style={{ margin: 0, fontSize: 12, color: theme.textDim }}>Quantity: {cartCount}</p>
                </div>
                <span style={{ fontWeight: 900, fontSize: 18, color: theme.accentGold }}>₹{totalBill}</span>
              </div>
              <p style={{ fontSize: 12, color: theme.textDim, fontStyle: 'italic', textAlign: 'right', margin: 0 }}>
                *Prices are simulated based on added quantity
              </p>
            </div>
          )}
        </div>

        {/* Checkout */}
        {cartCount > 0 && (
          <div style={{ borderTop: `1px solid ${theme.borderAdmin}`, paddingTop: 24, marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
              <span style={{ color: theme.textDim, fontWeight: 500 }}>Grand Total:</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: theme.accentGold }}>₹{totalBill}</span>
            </div>
            <button
              onClick={() => alert('Order Received! Shiv Dhaba mein aapka khana banna shuru ho gaya hai. 🎉')}
              style={{
                width: '100%',
                background: 'linear-gradient(to right, #FF6B01, #FFD700)',
                color: '#000',
                fontWeight: 900,
                padding: '16px',
                borderRadius: 12,
                border: 'none',
                fontSize: 13,
                cursor: 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
                boxShadow: '0 4px 20px rgba(255,107,1,0.3)',
                transition: 'opacity 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Place Order Via Cash On Delivery 🍛
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;
