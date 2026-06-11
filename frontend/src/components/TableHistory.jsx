import API_BASE from '../api.js';
import { useState, useEffect } from 'react';

const STATUS_STYLE = {
  Delivered: { bg: '#14532d', text: '#86efac', label: '✅ Delivered' },
  Cancelled: { bg: '#7f1d1d', text: '#fca5a5', label: '❌ Cancelled' },
  Pending:   { bg: '#78350f', text: '#fde68a', label: '🕐 Pending'   },
  Preparing: { bg: '#1e3a5f', text: '#93c5fd', label: '👨‍🍳 Preparing' },
  Ready:     { bg: '#14532d', text: '#86efac', label: '✅ Ready'      },
};

export default function TableHistory({ token }) {
  const [summary, setSummary]         = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [history, setHistory]         = useState([]);
  const [loadingS, setLoadingS]       = useState(true);
  const [loadingH, setLoadingH]       = useState(false);
  const [search, setSearch]           = useState('');

  // Fetch table summary on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/history/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setSummary(Array.isArray(data) ? data : []); setLoadingS(false); })
      .catch(() => setLoadingS(false));
  }, [token]);

  // Fetch history when a table is selected
  const openTable = async (table) => {
    setSelectedTable(table);
    setLoadingH(true);
    try {
      const r = await fetch(`${API_BASE}/api/history?table=${table}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(await r.json());
    } catch { setHistory([]); }
    setLoadingH(false);
  };

  const filteredSummary = summary.filter(s =>
    String(s.table).includes(search.trim())
  );

  // ── Table Detail Modal ──
  if (selectedTable) {
    const tableTotal = history.filter(o => o.status === 'Delivered').reduce((s, o) => s + Number(o.total || 0), 0);
    const allItems   = {};
    history.filter(o => o.status === 'Delivered').forEach(o =>
      (o.items || []).forEach(i => {
        allItems[i.name] = (allItems[i.name] || 0) + i.qty;
      })
    );
    const topItems = Object.entries(allItems).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return (
      <div>
        {/* Back + Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={() => { setSelectedTable(null); setHistory([]); }}
            style={{ background: '#1e1e1e', border: '1px solid #374151', borderRadius: 8, color: '#9ca3af', padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ← Back
          </button>
          <div>
            <h2 style={{ margin: 0, color: '#FF6B01', fontSize: 20, fontWeight: 800 }}>
              🪑 Table {selectedTable} — History
            </h2>
            <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 13 }}>
              {history.length} orders &nbsp;·&nbsp; ₹{tableTotal.toLocaleString('en-IN')} total spend
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Orders', value: history.length, icon: '📋', color: '#93c5fd' },
            { label: 'Delivered',    value: history.filter(o => o.status === 'Delivered').length, icon: '✅', color: '#86efac' },
            { label: 'Cancelled',    value: history.filter(o => o.status === 'Cancelled').length, icon: '❌', color: '#fca5a5' },
            { label: 'Total Spent',  value: `₹${tableTotal.toLocaleString('en-IN')}`, icon: '💰', color: '#fde68a' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1e1e1e', border: '1px solid #2d2d2d', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ margin: 0, fontSize: 22 }}>{stat.icon}</p>
              <p style={{ margin: '6px 0 2px', fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Top ordered items */}
        {topItems.length > 0 && (
          <div style={{ background: '#1e1e1e', border: '1px solid #2d2d2d', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#FF6B01', fontSize: 13 }}>🔥 Most Ordered Items</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {topItems.map(([name, qty]) => (
                <div key={name} style={{ background: '#2a1500', border: '1px solid #3a1f00', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#fde68a', fontWeight: 600 }}>
                  {name} <span style={{ color: '#FF6B01' }}>×{qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order list */}
        {loadingH
          ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>Loading...</div>
          : history.length === 0
            ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
                <p style={{ fontSize: 36, margin: '0 0 10px' }}>🍽️</p>
                <p>No history found for this table.</p>
              </div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.map(order => {
                  const st = STATUS_STYLE[order.status] || STATUS_STYLE['Pending'];
                  return (
                    <div key={order.id} style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderLeft: `4px solid ${st.text}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ background: st.bg, color: st.text, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{st.label}</span>
                          <span style={{ color: '#6b7280', fontSize: 12 }}>🕐 {order.time}</span>
                          {order.customer?.name && <span style={{ color: '#9ca3af', fontSize: 12 }}>👤 {order.customer.name}</span>}
                          {order.customer?.phone && <span style={{ color: '#6b7280', fontSize: 12 }}>📞 {order.customer.phone}</span>}
                        </div>
                        <span style={{ color: '#FF6B01', fontWeight: 800, fontSize: 16 }}>₹{order.total}</span>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {(order.items || []).map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#d1d5db' }}>
                            <span>
                              {item.name} <span style={{ color: '#6b7280' }}>×{item.qty}</span>
                              {item.note && <span style={{ color: '#f59e0b', fontSize: 11, marginLeft: 6 }}>📝 {item.note}</span>}
                            </span>
                            <span style={{ color: '#9ca3af' }}>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>

                      {/* Payment */}
                      {order.paymentMode && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #2d2d2d', display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af' }}>
                          <span>💳 {order.paymentMode}</span>
                          <span style={{ color: order.paymentStatus === 'Paid' ? '#86efac' : '#fca5a5' }}>
                            {order.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Unpaid'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
      </div>
    );
  }

  // ── Summary View (all tables) ──
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: '#FF6B01', fontSize: 20, fontWeight: 800 }}>📊 Table Order History</h2>
          <p style={{ margin: '3px 0 0', color: '#6b7280', fontSize: 13 }}>Kisi bhi table ka purana order record dekho</p>
        </div>
        <input
          type="text" placeholder="🔍 Search table..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: '#1e1e1e', border: '1px solid #374151', borderRadius: 8, padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none', width: 180 }}
        />
      </div>

      {loadingS
        ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading history...</div>
        : filteredSummary.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#6b7280' }}>
              <p style={{ fontSize: 48, margin: '0 0 12px' }}>🍽️</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Abhi tak koi history nahi</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Jab orders deliver ya cancel honge, yahan dikhenge</p>
            </div>
          )
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {filteredSummary.map(s => (
                <div key={s.table} onClick={() => openTable(s.table)}
                  style={{ background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B01'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d2d2d'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ background: '#FF6B01', color: '#fff', borderRadius: 10, padding: '6px 14px', fontWeight: 800, fontSize: 18 }}>
                      🪑 {s.table}
                    </div>
                    <span style={{ color: '#374151', fontSize: 20 }}>→</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#9ca3af' }}>Total Orders</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{s.orderCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#9ca3af' }}>Total Spent</span>
                      <span style={{ color: '#FF6B01', fontWeight: 700 }}>₹{s.totalSpent.toLocaleString('en-IN')}</span>
                    </div>
                    {s.lastOrder && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#6b7280' }}>Last Order</span>
                        <span style={{ color: '#6b7280' }}>{new Date(s.lastOrder).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
