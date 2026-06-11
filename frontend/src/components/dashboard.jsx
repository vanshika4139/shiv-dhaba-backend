export default function Dashboard({ orders, onRefresh }) {
  const totalRevenue   = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.total || 0), 0);
  const activeOrders   = orders.filter(o => o.status !== 'Delivered').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const itemCount = {};
  orders.forEach(order => { order.items?.forEach(it => { itemCount[it.name] = (itemCount[it.name] || 0) + it.qty; }); });
  const popular = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxQty  = popular[0]?.[1] || 1;

  const categoryRevenue = {};
  orders.forEach(order => { order.items?.forEach(it => { categoryRevenue[it.category || 'Other'] = (categoryRevenue[it.category || 'Other'] || 0) + it.price * it.qty; }); });
  const catData  = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCatRev = catData[0]?.[1] || 1;

  const recentOrders = orders.slice().reverse().slice(0, 5);

  const STATUS_STYLE = {
    Pending:   { bg: '#78350f', text: '#fde68a' },
    Preparing: { bg: '#1e3a5f', text: '#93c5fd' },
    Ready:     { bg: '#14532d', text: '#86efac' },
    Delivered: { bg: '#1f2937', text: '#9ca3af' },
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '📦', label: 'Total Orders',   value: orders.length,      color: '#FF6B01', sub: 'all time' },
          { icon: '⚡', label: 'Active Orders',  value: activeOrders,       color: '#93c5fd', sub: 'in progress' },
          { icon: '✅', label: 'Delivered',       value: deliveredOrders,    color: '#86efac', sub: 'completed' },
          { icon: '💰', label: 'Total Revenue',  value: `₹${totalRevenue}`, color: '#fbbf24', sub: 'from delivered orders' },
        ].map((card, i) => (
          <div key={i} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4', marginTop: 2 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Popular Items */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#FF6B01' }}>🔥 Popular Items</h3>
          {popular.length === 0
            ? <p style={{ color: '#6b7280', fontSize: 13 }}>No orders yet</p>
            : popular.map(([name, qty], i) => (
              <div key={name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#f0ece4', fontWeight: i === 0 ? 700 : 400 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} {name}
                  </span>
                  <span style={{ fontSize: 13, color: '#FF6B01', fontWeight: 700 }}>{qty}x</span>
                </div>
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(qty/maxQty)*100}%`, background: i === 0 ? '#FF6B01' : '#f59e0b', borderRadius: 4 }} />
                </div>
              </div>
            ))}
        </div>

        {/* Category Revenue */}
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#FF6B01' }}>📊 Revenue by Category</h3>
          {catData.length === 0
            ? <p style={{ color: '#6b7280', fontSize: 13 }}>No orders yet</p>
            : catData.map(([cat, rev]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: '#f0ece4' }}>{cat}</span>
                  <span style={{ fontSize: 13, color: '#86efac', fontWeight: 700 }}>₹{rev}</span>
                </div>
                <div style={{ background: '#2a2a2a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(rev/maxCatRev)*100}%`, background: 'linear-gradient(90deg, #22c55e, #16a34a)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#FF6B01' }}>📈 Order Status Breakdown</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Pending','Preparing','Ready','Delivered'].map(s => {
            const count = orders.filter(o => o.status === s).length;
            const pct   = orders.length ? Math.round((count/orders.length)*100) : 0;
            const st    = STATUS_STYLE[s];
            return (
              <div key={s} style={{ flex:1, minWidth:100, background:st.bg, borderRadius:10, padding:'14px 16px', textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:st.text }}>{count}</div>
                <div style={{ fontSize:11, color:st.text, opacity:0.8, marginTop:2 }}>{s}</div>
                <div style={{ fontSize:11, color:st.text, opacity:0.6 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
        {orders.length > 0 && (
          <div style={{ marginTop:14, height:8, borderRadius:4, display:'flex', overflow:'hidden', gap:1 }}>
            {[['Pending','#f59e0b'],['Preparing','#3b82f6'],['Ready','#22c55e'],['Delivered','#6b7280']].map(([s, color]) => {
              const pct = (orders.filter(o => o.status === s).length / orders.length) * 100;
              return pct > 0 ? <div key={s} style={{ width:`${pct}%`, background:color }} title={`${s}: ${Math.round(pct)}%`} /> : null;
            })}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '20px 22px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#FF6B01' }}>🕐 Recent Orders</h3>
          {onRefresh && <button onClick={onRefresh} style={{ background:'#1e1e1e', border:'1px solid #333', borderRadius:8, color:'#9ca3af', fontSize:12, padding:'4px 12px', cursor:'pointer' }}>🔄 Refresh</button>}
        </div>
        {recentOrders.length === 0
          ? <p style={{ color:'#6b7280', fontSize:13 }}>No orders yet</p>
          : recentOrders.map((o, i) => {
            const st = STATUS_STYLE[o.status] || STATUS_STYLE['Pending'];
            return (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#111', borderRadius:10, padding:'12px 16px', marginBottom:8 }}>
                <div>
                  <span style={{ color:'#FF6B01', fontWeight:700, fontSize:14 }}>{o.tableNumber || '—'}</span>
                  <span style={{ color:'#6b7280', fontSize:12, marginLeft:10 }}>{o.time}</span>
                  <p style={{ margin:'4px 0 0', fontSize:12, color:'#9ca3af' }}>
                    {o.items ? o.items.map(it => `${it.name} ×${it.qty}`).join(', ') : o.item}
                  </p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'#86efac', fontWeight:700, fontSize:14 }}>₹{o.total || '—'}</div>
                  <span style={{ background:st.bg, color:st.text, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, display:'inline-block', marginTop:4 }}>{o.status}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
