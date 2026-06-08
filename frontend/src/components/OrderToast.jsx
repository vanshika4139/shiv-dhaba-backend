export default function NotificationToast({ notifications, onDismiss }) {
  if (notifications.length === 0) return null;
  return (
    <div style={{ position:'fixed', top:80, right:20, zIndex:999, display:'flex', flexDirection:'column', gap:10, maxWidth:340 }}>
      {notifications.map(n => (
        <div key={n.id} style={{ background:'#1a0f00', border:'1.5px solid #FF6B01', borderRadius:12, padding:'14px 16px', boxShadow:'0 4px 24px rgba(255,107,1,0.25)', display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ fontSize:22, flexShrink:0 }}>🔔</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:800, color:'#FF6B01' }}>New Order! — {n.order.tableNumber}</span>
              <span style={{ fontSize:11, color:'#6b7280' }}>{n.order.time}</span>
            </div>
            <p style={{ margin:'0 0 6px', fontSize:12, color:'#d1d5db' }}>
              {n.order.items?.map(it => `${it.name} ×${it.qty}`).join(', ')}
            </p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#86efac' }}>₹{n.order.total}</span>
              <button onClick={() => onDismiss(n.id)} style={{ background:'#FF6B01', border:'none', borderRadius:6, color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', cursor:'pointer' }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}