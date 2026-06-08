import { useRef } from 'react';
import jsPDF from 'jspdf';

export default function BillPrint({ order, onClose }) {
  const handlePrintPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 200] });
    const x = 5; let y = 8;
    const lineH = 5; const pageW = 80;
    const center = (text, yPos) => { const w = doc.getTextWidth(text); doc.text(text, (pageW - w) / 2, yPos); };
    const line   = (yPos) => { doc.setDrawColor(180); doc.line(x, yPos, pageW - x, yPos); };

    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    center('SHIV DHABA & RESTRO', y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    center('Near Sai Mandir, Behat Road, Devla, SRE', y); y += 4;
    center('Ph: +91-8077382218', y); y += 4;
    center('Indian | Chinese | Tandoori', y); y += 5;
    line(y); y += 4;

    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`Table: ${order.tableNumber || '—'}`, x, y);
    doc.text(`Time: ${order.time}`, pageW - x - doc.getTextWidth(`Time: ${order.time}`), y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #${String(order._id || order.id).slice(-6)}`, x, y); y += 4;
    line(y); y += 4;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Item', x, y); doc.text('Qty', 44, y); doc.text('Price', 56, y); doc.text('Amt', pageW - x - 6, y);
    y += 1; line(y); y += 4;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    let subtotal = 0;
    (order.items || []).forEach(item => {
      const amt = item.price * item.qty; subtotal += amt;
      const nameLines = doc.splitTextToSize(item.name, 36);
      doc.text(nameLines, x, y);
      doc.text(String(item.qty), 44, y);
      doc.text(`${item.price}`, 56, y);
      doc.text(`${amt}`, pageW - x - doc.getTextWidth(String(amt)), y);
      y += nameLines.length * lineH;
    });

    line(y); y += 4;
    doc.text('Subtotal:', x, y); doc.setFont('helvetica', 'bold');
    doc.text(`Rs.${subtotal}`, pageW - x - doc.getTextWidth(`Rs.${subtotal}`), y); y += lineH;
    line(y); y += 4;
    doc.setFontSize(10);
    doc.text('TOTAL:', x, y);
    doc.text(`Rs.${subtotal}`, pageW - x - doc.getTextWidth(`Rs.${subtotal}`), y); y += 7;
    line(y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    center('Thank you for dining with us!', y); y += 4;
    center('Please visit again :)', y);

    doc.save(`Bill_${order.tableNumber}_${order.time?.replace(':', '-')}.pdf`);
  };

  if (!order) return null;
  const total = order.total || (order.items?.reduce((s, i) => s + i.price * i.qty, 0) || 0);

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, backdropFilter:'blur(3px)' }} />
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:301, width:'min(400px, 95vw)', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:16, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.7)' }}>

        <div style={{ background:'#1a0a00', borderBottom:'1px solid #2a1500', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:'#FF6B01' }}>🧾 Bill / Invoice</h2>
            <p style={{ margin:'3px 0 0', fontSize:12, color:'#a08060' }}>{order.tableNumber} • {order.time}</p>
          </div>
          <button onClick={onClose} style={{ background:'#2a1500', border:'none', color:'#f0ece4', width:32, height:32, borderRadius:'50%', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <div style={{ padding:'20px', fontFamily:"'Courier New', monospace", maxHeight:'60vh', overflowY:'auto' }}>
          <div style={{ textAlign:'center', marginBottom:16 }}>
            <p style={{ margin:0, fontSize:16, fontWeight:800, color:'#FF6B01', letterSpacing:1 }}>SHIV DHABA & RESTRO</p>
            <p style={{ margin:'3px 0', fontSize:10, color:'#6b7280' }}>Near Sai Mandir, Behat Road, Devla, SRE</p>
            <p style={{ margin:'2px 0', fontSize:10, color:'#6b7280' }}>Ph: +91-8077382218</p>
          </div>
          <div style={{ borderTop:'1px dashed #333', margin:'10px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9ca3af', marginBottom:4 }}>
            <span>Table: <b style={{ color:'#FF6B01' }}>{order.tableNumber}</b></span>
            <span>Time: {order.time}</span>
          </div>
          <p style={{ margin:'0 0 10px', fontSize:11, color:'#6b7280' }}>Order #{String(order._id || order.id).slice(-6)}</p>
          <div style={{ borderTop:'1px dashed #333', margin:'8px 0' }} />
          <div style={{ display:'flex', fontSize:11, fontWeight:700, color:'#9ca3af', marginBottom:6 }}>
            <span style={{ flex:1 }}>Item</span>
            <span style={{ width:30, textAlign:'center' }}>Qty</span>
            <span style={{ width:50, textAlign:'right' }}>Price</span>
            <span style={{ width:55, textAlign:'right' }}>Amt</span>
          </div>
          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display:'flex', fontSize:12, color:'#e5e7eb', marginBottom:6, alignItems:'flex-start' }}>
              <span style={{ flex:1, paddingRight:6 }}>{item.name}</span>
              <span style={{ width:30, textAlign:'center', color:'#9ca3af' }}>×{item.qty}</span>
              <span style={{ width:50, textAlign:'right', color:'#9ca3af' }}>₹{item.price}</span>
              <span style={{ width:55, textAlign:'right', fontWeight:600 }}>₹{item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ borderTop:'1px dashed #333', margin:'10px 0 8px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9ca3af', marginBottom:4 }}>
            <span>Subtotal</span><span>₹{total}</span>
          </div>
          <div style={{ borderTop:'1px solid #333', margin:'8px 0', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:15, fontWeight:800, color:'#f0ece4' }}>TOTAL</span>
            <span style={{ fontSize:15, fontWeight:800, color:'#FF6B01' }}>₹{total}</span>
          </div>
          <div style={{ borderTop:'1px dashed #333', margin:'12px 0 8px' }} />
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:'0 0 3px', fontSize:11, color:'#a08060' }}>Thank you for dining with us! 🙏</p>
            <p style={{ margin:0, fontSize:11, color:'#6b7280' }}>Please visit again ❤️</p>
          </div>
        </div>

        <div style={{ padding:'16px 20px', borderTop:'1px solid #1e1e1e', display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', background:'#1e1e1e', border:'1px solid #333', borderRadius:8, color:'#9ca3af', fontSize:13, cursor:'pointer', fontWeight:600 }}>Cancel</button>
          <button onClick={handlePrintPDF} style={{ flex:2, padding:'11px', background:'#FF6B01', border:'none', borderRadius:8, color:'#fff', fontSize:14, cursor:'pointer', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            🖨️ Download Bill PDF
          </button>
        </div>
      </div>
    </>
  );
}