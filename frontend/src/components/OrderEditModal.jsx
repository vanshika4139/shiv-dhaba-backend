const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1500';
import { useState, useEffect } from 'react';

export default function OrderEditModal({ order, menuItems, onClose, onSave, token }) {
  const [items, setItems]     = useState(order.items ? [...order.items] : []);
  const [search, setSearch]   = useState('');
  const [saving, setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'add'

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const updateQty = (name, delta) => {
    setItems(prev =>
      prev.map(i => i.name === name ? { ...i, qty: i.qty + delta } : i)
          .filter(i => i.qty > 0)
    );
  };

  const removeItem = (name) => {
    setItems(prev => prev.filter(i => i.name !== name));
  };

  const addMenuItem = (menuItem) => {
    const exists = items.find(i => i.name === menuItem.name);
    if (exists) {
      setItems(prev => prev.map(i => i.name === menuItem.name ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setItems(prev => [...prev, { name: menuItem.name, price: menuItem.price, qty: 1, note: '' }]);
    }
  };

  const filteredMenu = menuItems.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (items.length === 0) { alert('Order mein kam se kam 1 item hona chahiye!'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/order/${(order._id || order.id)}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items, total }),
      });
      const data = await res.json();
      onSave(data.order);
      onClose();
    } catch { alert('Order update nahi hua!'); }
    setSaving(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, backdropFilter:'blur(3px)' }} />

      <div style={{
        position:'fixed', top:'50%', left:'50%',
        transform:'translate(-50%, -50%)',
        zIndex:301,
        width:'min(520px, 96vw)',
        maxHeight:'90vh',
        background:'#0f0f0f',
        border:'1px solid #2a2a2a',
        borderRadius:16,
        overflow:'hidden',
        display:'flex', flexDirection:'column',
        boxShadow:'0 20px 60px rgba(0,0,0,0.7)'
      }}>

        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #2a2a2a', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a0a00' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:'#FF6B01' }}>✏️ Edit Order</h2>
            <p style={{ margin:'3px 0 0', fontSize:12, color:'#a08060' }}>{order.tableNumber} • {order.time}</p>
          </div>
          <button onClick={onClose} style={{ background:'#2a1500', border:'none', color:'#f0ece4', width:32, height:32, borderRadius:'50%', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid #2a2a2a' }}>
          {[
            { id:'current', label:`📋 Current Items (${items.length})` },
            { id:'add',     label:'➕ Add Items' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex:1, padding:'10px', border:'none', cursor:'pointer',
              background: activeTab === tab.id ? '#1e1e1e' : '#141414',
              color: activeTab === tab.id ? '#FF6B01' : '#6b7280',
              fontSize:13, fontWeight: activeTab === tab.id ? 700 : 400,
              borderBottom: activeTab === tab.id ? '2px solid #FF6B01' : '2px solid transparent',
              transition:'all 0.2s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto' }}>

          {/* Current Items Tab */}
          {activeTab === 'current' && (
            <div style={{ padding:'16px 20px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#6b7280' }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>🍽️</p>
                  <p style={{ margin:0, fontSize:13 }}>No items — add from menu tab</p>
                </div>
              ) : items.map((item, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 0', borderBottom:'1px solid #1e1e1e'
                }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:'0 0 2px', fontSize:14, fontWeight:600, color:'#f0ece4' }}>{item.name}</p>
                    <p style={{ margin:0, fontSize:12, color:'#FF6B01' }}>
                      ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
                    </p>
                    {item.note && <p style={{ margin:'2px 0 0', fontSize:11, color:'#f59e0b' }}>📝 {item.note}</p>}
                  </div>

                  {/* Qty controls */}
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <button onClick={() => updateQty(item.name, -1)} style={{
                      width:26, height:26, borderRadius:'50%',
                      border:'1px solid #374151', background:'#1f2937',
                      color:'#f0ece4', fontSize:14, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>−</button>
                    <span style={{ fontSize:14, fontWeight:700, color:'#f0ece4', minWidth:18, textAlign:'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.name, 1)} style={{
                      width:26, height:26, borderRadius:'50%',
                      border:'none', background:'#FF6B01',
                      color:'#fff', fontSize:14, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>+</button>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item.name)} style={{
                    background:'#2a0a0a', border:'1px solid #7f1d1d',
                    borderRadius:6, color:'#f87171',
                    fontSize:11, padding:'4px 8px', cursor:'pointer'
                  }}>Remove</button>
                </div>
              ))}

              {/* New total */}
              {items.length > 0 && (
                <div style={{
                  marginTop:14, padding:'12px 14px',
                  background:'#1a1a1a', borderRadius:10,
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <p style={{ margin:0, fontSize:12, color:'#6b7280' }}>Original: ₹{order.total}</p>
                    {total !== order.total && (
                      <p style={{ margin:'2px 0 0', fontSize:11, color: total > order.total ? '#f87171' : '#86efac' }}>
                        {total > order.total ? `+₹${total - order.total} extra` : `-₹${order.total - total} reduced`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:11, color:'#6b7280', textAlign:'right' }}>New Total</p>
                    <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#FF6B01' }}>₹{total}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Items Tab */}
          {activeTab === 'add' && (
            <div style={{ padding:'16px 20px' }}>
              {/* Search */}
              <div style={{ position:'relative', marginBottom:14 }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', opacity:0.5 }}>🔍</span>
                <input type="text" placeholder="Search menu..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width:'100%', boxSizing:'border-box', padding:'9px 10px 9px 32px', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, color:'#f0ece4', fontSize:13, outline:'none' }}
                  onFocus={e => e.target.style.borderColor='#FF6B01'}
                  onBlur={e => e.target.style.borderColor='#2a2a2a'} />
              </div>

              {/* Menu items */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {filteredMenu.map(menuItem => {
                  const inCart = items.find(i => i.name === menuItem.name);
                  return (
                    <div key={menuItem.id || menuItem._id} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'10px 12px', background:'#1a1a1a', borderRadius:8,
                      border: inCart ? '1px solid #FF6B01' : '1px solid #2a2a2a'
                    }}>
                      <div>
                        <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:600, color:'#f0ece4' }}>{menuItem.name}</p>
                        <p style={{ margin:0, fontSize:12, color:'#FF6B01', fontWeight:700 }}>₹{menuItem.price}
                          <span style={{ color:'#6b7280', fontSize:11, marginLeft:4 }}>{menuItem.category}</span>
                        </p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {inCart && (
                          <span style={{ fontSize:11, color:'#FF6B01', fontWeight:700 }}>×{inCart.qty}</span>
                        )}
                        <button onClick={() => addMenuItem(menuItem)} style={{
                          width:30, height:30, borderRadius:'50%', border:'none',
                          background: inCart ? '#22c55e' : '#FF6B01',
                          color:'#fff', fontSize:18, cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:700
                        }}>{inCart ? '✓' : '+'}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid #2a2a2a', display:'flex', gap:10, background:'#0f0f0f' }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', background:'#1e1e1e', border:'1px solid #333', borderRadius:8, color:'#9ca3af', fontSize:13, cursor:'pointer', fontWeight:600 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            flex:2, padding:'11px', background:'#FF6B01', border:'none',
            borderRadius:8, color:'#fff', fontSize:14, cursor: saving ? 'wait' : 'pointer',
            fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:8
          }}>
            {saving ? '⏳ Saving...' : `✅ Save Changes — ₹${total}`}
          </button>
        </div>
      </div>
    </>
  );
}