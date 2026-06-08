import React, { useState, useEffect, useRef, useCallback } from 'react';
import Login             from './components/login';
import Menu              from './components/Menu';
import Cart              from './components/cart';
import Dashboard         from './components/dashboard';
import NotificationToast from './components/OrderToast';
import BillModal         from './components/BillPrint';
import OrderEditModal    from './components/OrderEditModal';
import TableHistory      from './components/TableHistory';
import OrderTimer        from './components/OrderTimer';
import UrgentBadge       from './components/UrgentBadge';
import { useSocket }     from './hooks/socketHook';
import OrderTracking     from './components/OrderTracking';
import RatingModal       from './components/RatingModal';
import { ThemeProvider, ThemeToggle, useTheme } from './components/ThemeContext';

const STATUS_FLOW  = ['Pending', 'Preparing', 'Ready', 'Delivered'];
const STATUS_STYLE = {
  Pending:   { bg: '#78350f', text: '#fde68a', label: '🕐 Pending' },
  Preparing: { bg: '#1e3a5f', text: '#93c5fd', label: '👨‍🍳 Preparing' },
  Ready:     { bg: '#14532d', text: '#86efac', label: '✅ Ready' },
  Delivered: { bg: '#1f2937', text: '#9ca3af', label: '📦 Delivered' },
};

// Language strings
const LANG = {
  en: {
    search: 'Search dishes...', noItems: 'No items found', loading: 'Loading menu...',
    addToCart: 'Add to cart', viewCart: 'View Cart', placeOrder: 'Place Order',
    orderPlaced: "Order placed! We'll have it ready soon 🍛",
    selectTable: 'Select Your Table', required: '← required!',
    cartEmpty: 'Your cart is empty', addFromMenu: 'Add items from the menu',
    total: 'Total', orderFor: 'Order for',
    adminBtn: '🔐 Admin', adminPanel: 'Admin Panel',
    dashboard: '📊 Dashboard', orders: '📋 Orders', menu: '🍽️ Menu',
    live: 'Live — new orders will appear instantly', offline: 'Offline',
    noOrders: 'No orders found.', refresh: '🔄 Refresh',
    addNewItem: '➕ Add New Item', currentMenu: '📃 Current Menu Items',
    noMenuItems: 'No items yet.', photo: 'Photo (optional)', changePhoto: 'Change photo',
    logout: 'Logout', printBill: '🧾 Print Bill', markAs: 'Mark as',
    complete: 'Complete ✓', updating: 'Updating...',
    allFields: 'All fields are required!', validPrice: 'Please enter a valid price!',
    addFailed: 'Could not add item. Check the server!',
    deleteFailed: 'Could not delete. Check the server!',
    uploadFailed: 'Image upload failed!', statusFailed: 'Could not update status!',
    cancelOrder: 'Cancel Order', cancelConfirm: 'Cancel this order?', cancelFailed: 'Could not cancel order!',
    myOrders: 'My Orders', noMyOrders: 'No orders yet.', cancelledMsg: '✅ Order cancelled!',
    trackOrder: '📦 Track Order', rateOrder: '⭐ Rate',
  },
  hi: {
    search: 'Dish dhundho...', noItems: 'Koi item nahi mila', loading: 'Menu load ho raha hai...',
    addToCart: 'Cart mein daalo', viewCart: 'Cart Dekho', placeOrder: 'Order Karo',
    orderPlaced: 'Order place ho gaya! Thoda wait karo 🍛',
    selectTable: 'Apni Table Chuno', required: '← zaroori hai!',
    cartEmpty: 'Cart khaali hai', addFromMenu: 'Menu se items add karo',
    total: 'Kul', orderFor: 'Order kiske liye',
    adminBtn: '🔐 Admin', adminPanel: 'Admin Panel',
    dashboard: '📊 Dashboard', orders: '📋 Orders', menu: '🍽️ Menu',
    live: 'Live — naye orders turant dikhenge', offline: 'Offline',
    noOrders: 'Koi order nahi aaya.', refresh: '🔄 Refresh',
    addNewItem: '➕ Naya Item Add Karo', currentMenu: '📃 Current Menu Items',
    noMenuItems: 'Koi item nahi hai.', photo: 'Photo (optional)', changePhoto: 'Photo badlo',
    logout: 'Logout', printBill: '🧾 Bill Print Karo', markAs: 'Mark karo as',
    complete: 'Complete ✓', updating: 'Update ho raha hai...',
    allFields: 'Sabhi fields bharna zaroori hai!', validPrice: 'Sahi price daalo!',
    addFailed: 'Item add nahi hua. Server check karo!',
    deleteFailed: 'Delete nahi hua. Server check karo!',
    uploadFailed: 'Image upload nahi hui!', statusFailed: 'Status update nahi hua!',
    cancelOrder: 'Order Cancel Karo', cancelConfirm: 'Yeh order cancel karein?', cancelFailed: 'Order cancel nahi hua!',
    myOrders: 'Mere Orders', noMyOrders: 'Abhi tak koi order nahi kiya.', cancelledMsg: '✅ Order cancel ho gaya!',
    trackOrder: '📦 Track Karo', rateOrder: '⭐ Rate Karo',
  }
};

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

function App() {
  const { theme } = useTheme();
  const [user, setUser]               = useState(null);
  const [token, setToken]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLang]               = useState('en');
  const t = LANG[lang];

  const [orders, setOrders]       = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [adminTab, setAdminTab]   = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId]     = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [billOrder, setBillOrder]   = useState(null);
  const [editOrder, setEditOrder]   = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Add item form
  const [newItem, setNewItem]           = useState({ name: '', price: '', category: '' });
  const [addError, setAddError]         = useState('');
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef  = useRef(null);
  const [uploadingId, setUploadingId]   = useState(null);

  // Cart
  const [cart, setCart]               = useState([]);
  const [cartOpen, setCartOpen]       = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [myOrders, setMyOrders]         = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);

  // ── Order Tracking & Rating ──
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [ratingOrder, setRatingOrder]         = useState(null);

  /* ── Auto-login ── */
  useEffect(() => {
    const savedToken = localStorage.getItem('dhaba_token');
    const savedUser  = localStorage.getItem('dhaba_user');
    const savedLang  = localStorage.getItem('dhaba_lang');
    if (savedLang) setLang(savedLang);
    if (savedToken && savedUser) {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${savedToken}` } })
        .then(r => r.json())
        .then(data => { if (data.user) { setToken(savedToken); setUser(JSON.parse(savedUser)); } else { localStorage.removeItem('dhaba_token'); localStorage.removeItem('dhaba_user'); } })
        .catch(() => {})
        .finally(() => setAuthLoading(false));
    } else { setAuthLoading(false); }
  }, []);

  /* ── Socket ── */
  const handleNewOrder = useCallback((order) => {
    setOrders(prev => [...prev, order]);
    const nid = Date.now();
    setNotifications(prev => [...prev, { id: nid, order }]);
    playBeep();
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== nid)), 8000);
  }, []);

  const handleSocketStatusUpdate = useCallback((id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setMyOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  const handleOrderCancelled = useCallback((id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setMyOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o));
  }, []);

  // ── NEW: socket handler for urgent updates from other tabs ──
  const handleSocketUrgent = useCallback((id, urgent) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, urgent } : o));
  }, []);

  const { connected } = useSocket(user?.role, handleNewOrder, handleSocketStatusUpdate, handleOrderCancelled, handleSocketUrgent);

  /* ── Fetch ── */
  const fetchOrders = async () => {
    try { const r = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } }); if (r.ok) setOrders(await r.json()); } catch {}
  };
  const fetchMenu = async () => {
    try { const r = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`); setMenuItems(await r.json()); } catch {}
  };

  useEffect(() => {
    if (user?.role === 'admin' && token) { fetchOrders(); fetchMenu(); }
    else if (!user) { fetchMenu(); }
  }, [user, token]);

  /* ── Auth ── */
  const handleLogin = (userData, jwtToken) => { setUser(userData); setToken(jwtToken); setShowAdminLogin(false); };
  const handleLogout = () => {
    localStorage.removeItem('dhaba_token'); localStorage.removeItem('dhaba_user');
    setUser(null); setToken(null); setOrders([]); setMenuItems([]);
  };

  /* ── Language toggle ── */
  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    localStorage.setItem('dhaba_lang', next);
  };

  /* ── Status ── */
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/order/${orderId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch { alert(t.statusFailed); }
    setUpdatingId(null);
  };
  const getNextStatus = (cur) => { const i = STATUS_FLOW.indexOf(cur); return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };

  /* ── NEW: Urgent toggle handler ── */
  const handleUrgentToggle = useCallback((orderId, newUrgent) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, urgent: newUrgent } : o));
  }, []);

  /* ── Admin: Cancel Order ── */
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t.cancelConfirm)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order/${orderId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setOrders(prev => prev.filter(o => o.id !== orderId));
      else alert(t.cancelFailed);
    } catch { alert(t.cancelFailed); }
  };

  /* ── Cart ── */
  const handleAddToCart = (item) => {
    const id = item.id || item._id;
    setCart(prev => { const ex = prev.find(i => (i.id || i._id) === id); if (ex) return prev.map(i => (i.id || i._id) === id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...item, qty: 1 }]; });
  };
  const handleOrderPlaced = (placedOrder) => {
    if (placedOrder) {
      setMyOrders(prev => [...prev, { ...placedOrder, status: 'Pending' }]);
    }
    setCart([]); setTableNumber('');
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  // Called by OrderTracking when status reaches Delivered
  const handleOrderDelivered = (deliveredOrder) => {
    setTrackingOrderId(null);
    setRatingOrder(deliveredOrder);
    // Also update myOrders list
    setMyOrders(prev => prev.map(o =>
      (o._id || o.id) === (deliveredOrder._id || deliveredOrder.id)
        ? { ...o, status: 'Delivered' }
        : o
    ));
  };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  /* ── Customer: cancel own order ── */
  const handleCustomerCancel = async (orderId) => {
    if (!window.confirm(t.cancelConfirm)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      } else { alert(t.cancelFailed); }
    } catch { alert(t.cancelFailed); }
  };

  /* ── Menu CRUD ── */
  const handleImagePick = (e) => { const f = e.target.files[0]; if (!f) return; setImageFile(f); setImagePreview(URL.createObjectURL(f)); };

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.price || !newItem.category.trim()) { setAddError(t.allFields); return; }
    if (isNaN(newItem.price) || Number(newItem.price) <= 0) { setAddError(t.validPrice); return; }
    try {
      const fd = new FormData();
      fd.append('name', newItem.name.trim()); fd.append('price', newItem.price); fd.append('category', newItem.category.trim());
      if (imageFile) fd.append('image', imageFile);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`, { method: 'POST', body: fd });
      const data = await res.json();
      setMenuItems(prev => [...prev, data]);
      setNewItem({ name: '', price: '', category: '' }); setImageFile(null); setImagePreview(null); setAddError('');
    } catch { setAddError(t.addFailed); }
  };

  const handleRowImageUpload = async (itemId, file) => {
    if (!file) return; setUploadingId(itemId);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu/${itemId}/image`, { method: 'PATCH', body: fd });
      const data = await res.json();
      setMenuItems(prev => prev.map(i => i.id === itemId ? data : i));
    } catch { alert(t.uploadFailed); }
    setUploadingId(null);
  };

  const handleDeleteItem = async (id) => {
    try { await fetch(`${import.meta.env.VITE_API_URL}/api/menu/${id}`, { method: 'DELETE' }); setMenuItems(prev => prev.filter(i => i.id !== id)); }
    catch { alert(t.deleteFailed); }
  };

  /* ── Loading screen ── */
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#FF6B01' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
        <p style={{ color: '#a08060', fontFamily: 'sans-serif' }}>Loading...</p>
      </div>
    </div>
  );

  const filteredOrders = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);
  const counts = STATUS_FLOW.reduce((a, s) => { a[s] = orders.filter(o => o.status === s).length; return a; }, {});

  // ── NEW: urgent orders float to top ──
  const sortedOrders = filteredOrders
    .slice()
    .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || b.id - a.id);

  const urgentCount = orders.filter(o => o.urgent && o.status !== 'Delivered').length;

  const TABS = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'orders',    label: t.orders, badge: orders.filter(o => o.status !== 'Delivered').length },
    { id: 'menu',      label: t.menu },
    { id: 'history',   label: '📜 History' },
  ];

  /* ── Language toggle button ── */
  const LangBtn = () => (
    <button onClick={toggleLang} style={{
      background: '#1e1e1e', border: '1px solid #3a1f00',
      borderRadius: 20, padding: '5px 14px',
      color: '#FF6B01', fontSize: 12, fontWeight: 700,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
    }}>
      🌐 {lang === 'en' ? 'हिंदी' : 'English'}
    </button>
  );

  return (
    <div>

      {/* ═══════ CUSTOMER VIEW ═══════ */}
      {!user && (
        <div style={{ position: 'relative' }}>

          {/* ── OrderTracking Modal ── */}
          {trackingOrderId && (
            <OrderTracking
              orderId={trackingOrderId}
              onClose={() => setTrackingOrderId(null)}
              onDelivered={handleOrderDelivered}
            />
          )}

          {/* ── RatingModal (after Delivered) ── */}
          {ratingOrder && (
            <RatingModal
              order={ratingOrder}
              onClose={() => setRatingOrder(null)}
              onSubmitted={() => setRatingOrder(null)}
            />
          )}

          {orderSuccess && (
            <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, zIndex: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
              ✅ {t.orderPlaced}
            </div>
          )}

          {/* Top-right buttons */}
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, display: 'flex', gap: 8, alignItems: 'center' }}>
            <LangBtn />
            {myOrders.length > 0 && (
              <button onClick={() => setShowMyOrders(true)} style={{
                background: 'rgba(20,10,0,0.85)', border: '1px solid #22c55e',
                borderRadius: 8, color: '#22c55e', fontSize: 12,
                fontWeight: 700, padding: '6px 14px', cursor: 'pointer',
                backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 6
              }}>
                📋 {t.myOrders}
                <span style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{myOrders.length}</span>
              </button>
            )}
            <button onClick={() => setShowAdminLogin(true)} style={{
              background: 'rgba(20,10,0,0.85)', border: '1px solid #FF6B01',
              borderRadius: 8, color: '#FF6B01', fontSize: 12,
              fontWeight: 700, padding: '6px 14px', cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}>{t.adminBtn}</button>
          </div>

          {/* Admin login modal */}
          {showAdminLogin && (
            <>
              <div onClick={() => setShowAdminLogin(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200 }} />
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, width: 'min(380px, 94vw)' }}>
                <Login onLogin={handleLogin} lang={lang} />
              </div>
            </>
          )}

          {/* My Orders modal */}
          {showMyOrders && (
            <>
              <div onClick={() => setShowMyOrders(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200 }} />
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, width: 'min(480px, 96vw)', maxHeight: '80vh', background: '#1a1a1a', borderRadius: 16, border: '1px solid #2d2d2d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid #2d2d2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: '#FF6B01', fontSize: 18, fontWeight: 800 }}>📋 {t.myOrders}</h2>
                  <button onClick={() => setShowMyOrders(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myOrders.length === 0
                    ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>{t.noMyOrders}</p>
                    : myOrders.slice().reverse().map(order => {
                        const st = STATUS_STYLE[order.status] || STATUS_STYLE['Pending'];
                        const isCancelled = order.status === 'Cancelled';
                        return (
                          <div key={order.id} style={{ background: '#242424', borderRadius: 12, padding: 16, borderLeft: `4px solid ${isCancelled ? '#ef4444' : st.text}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Table {order.tableNumber} &nbsp;·&nbsp; {order.time}</span>
                                <div style={{ display: 'inline-block', marginLeft: 10, background: isCancelled ? '#7f1d1d' : st.bg, color: isCancelled ? '#fca5a5' : st.text, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                                  {isCancelled ? '❌ Cancelled' : st.label}
                                </div>
                              </div>
                              <span style={{ color: '#FF6B01', fontWeight: 800, fontSize: 15 }}>₹{order.total}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                              {(order.items || []).map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#d1d5db', fontSize: 13 }}>
                                  <span>{item.name} × {item.qty}</span>
                                  <span style={{ color: '#9ca3af' }}>₹{item.price * item.qty}</span>
                                </div>
                              ))}
                            </div>
                            {!isCancelled && order.status !== 'Delivered' && order.status !== 'Preparing' && order.status !== 'Ready' && (
                              <button onClick={() => handleCustomerCancel(order.id)}
                                style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 8, cursor: 'pointer', width: '100%' }}>
                                ❌ {t.cancelOrder}
                              </button>
                            )}
                            {(isCancelled || order.status === 'Preparing' || order.status === 'Ready') && !isCancelled && (
                              <p style={{ color: '#6b7280', fontSize: 11, textAlign: 'center', margin: 0 }}>Cancel unavailable — order is {order.status}</p>
                            )}
                            {/* ── Track & Rate Buttons ── */}
                            {!isCancelled && (
                              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                <button
                                  onClick={() => { setTrackingOrderId(order._id || order.id); setShowMyOrders(false); }}
                                  style={{
                                    flex: 1, padding: '8px 0',
                                    background: '#1a1000', border: '1px solid #FF6B01',
                                    borderRadius: 8, color: '#FF6B01',
                                    fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                  }}>
                                  {t.trackOrder}
                                </button>
                                {order.status === 'Delivered' && (
                                  <button
                                    onClick={() => { setRatingOrder(order); setShowMyOrders(false); }}
                                    style={{
                                      flex: 1, padding: '8px 0',
                                      background: '#2a1800', border: '1px solid #FF6B01',
                                      borderRadius: 8, color: '#FF6B01',
                                      fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                    }}>
                                    {t.rateOrder}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                </div>
              </div>
            </>
          )}

          {/* Floating cart */}
          {cartCount > 0 && (
            <button onClick={() => setCartOpen(true)} style={{
              position: 'fixed', bottom: 24, right: 24,
              background: '#FF6B01', border: 'none', borderRadius: 50,
              padding: '14px 22px', color: '#fff', fontWeight: 800, fontSize: 15,
              cursor: 'pointer', zIndex: 150,
              boxShadow: '0 4px 20px rgba(255,107,1,0.5)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              🛒
              <span style={{ background: '#fff', color: '#FF6B01', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{cartCount}</span>
              {t.viewCart} — ₹{cart.reduce((s, i) => s + i.price * i.qty, 0)}
            </button>
          )}

          <Menu onAddToCart={handleAddToCart} lang={lang} t={t} />

          {cartOpen && (
            <Cart cart={cart} onUpdate={setCart} onClose={() => setCartOpen(false)}
              tableNumber={tableNumber} onTableChange={setTableNumber}
              onOrderPlaced={handleOrderPlaced} t={t} />
          )}
        </div>
      )}

      {/* ═══════ ADMIN VIEW ═══════ */}
      {user?.role === 'admin' && (
        <>
          <NotificationToast notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
          {billOrder && <BillModal order={billOrder} onClose={() => setBillOrder(null)} />}
          {editOrder && (
            <OrderEditModal
              order={editOrder}
              menuItems={menuItems}
              token={token}
              onClose={() => setEditOrder(null)}
              onSave={(updatedOrder) => {
                setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
              }}
            />
          )}

          <nav className="px-6 py-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-50" style={{ background: theme.bg, borderColor: theme.border }}>
            <div>
              <h1 className="text-xl font-bold text-[#FF6B01] m-0">🍽️ SHIV DHABA</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }} />
                <p className="text-xs m-0" style={{ color: connected ? '#22c55e' : '#ef4444' }}>
                  {connected ? t.live : t.offline}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LangBtn />
              <ThemeToggle />
              {/* ── NEW: urgent orders indicator in navbar ── */}
              {urgentCount > 0 && (
                <button
                  onClick={() => { setAdminTab('orders'); setStatusFilter('All'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#450a0a', border: '1.5px solid #ef4444',
                    borderRadius: 20, padding: '4px 12px',
                    color: '#f87171', fontSize: 12, fontWeight: 800,
                    cursor: 'pointer',
                    animation: 'urgentPulse 1.8s ease-in-out infinite',
                  }}
                >
                  <style>{`
                    @keyframes urgentPulse {
                      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0); }
                      50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0.2); }
                    }
                  `}</style>
                  🚨 {urgentCount} Urgent
                </button>
              )}
              {notifications.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: 20 }}>🔔</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.length}</span>
                </div>
              )}
              <button onClick={handleLogout} className="bg-red-700 hover:bg-red-600 transition px-4 py-1.5 rounded text-sm">{t.logout}</button>
            </div>
          </nav>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pt-5 border-b border-gray-800">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setAdminTab(tab.id)}
                className={`px-5 py-2 rounded-t-lg font-semibold text-sm transition ${adminTab === tab.id ? 'bg-[#1e1e1e] border border-b-0 border-gray-700 text-[#FF6B01]' : 'text-gray-400 hover:text-gray-200'}`}>
                {tab.label}
                {tab.badge > 0 && <span className="ml-2 bg-[#FF6B01] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Dashboard */}
            {adminTab === 'dashboard' && <Dashboard orders={orders} onRefresh={fetchOrders} t={t} />}

            {/* Orders */}
            {adminTab === 'orders' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {STATUS_FLOW.map(s => {
                    const st = STATUS_STYLE[s];
                    return (
                      <div key={s} onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                        style={{ background: st.bg, cursor: 'pointer', border: statusFilter === s ? '2px solid #FF6B01' : '2px solid transparent' }}
                        className="rounded-xl p-4 transition">
                        <p style={{ color: st.text }} className="text-2xl font-bold m-0">{counts[s]}</p>
                        <p style={{ color: st.text }} className="text-sm m-0 opacity-80">{st.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 mb-5 flex-wrap items-center">
                  {['All', ...STATUS_FLOW].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      style={s !== 'All' ? { background: statusFilter === s ? STATUS_STYLE[s].bg : 'transparent', color: statusFilter === s ? STATUS_STYLE[s].text : '#9ca3af', borderColor: statusFilter === s ? STATUS_STYLE[s].text : '#374151' } : {}}
                      className={`px-4 py-1.5 rounded-full text-sm border transition font-medium ${s === 'All' && statusFilter === 'All' ? 'bg-[#FF6B01] text-white border-[#FF6B01]' : ''} ${s === 'All' && statusFilter !== 'All' ? 'bg-transparent text-gray-400 border-gray-600' : ''}`}>
                      {s === 'All' ? `All (${orders.length})` : `${STATUS_STYLE[s].label} (${counts[s]})`}
                    </button>
                  ))}
                  <button onClick={fetchOrders} className="ml-auto px-4 py-1.5 rounded-full text-sm border border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400 transition">{t.refresh}</button>
                </div>
                {sortedOrders.length === 0
                  ? <div className="text-center py-16 text-gray-500"><p className="text-4xl mb-3">🍽️</p><p>{t.noOrders}</p></div>
                  : (
                    <div className="flex flex-col gap-4">
                      {sortedOrders.map(order => {
                        const st = STATUS_STYLE[order.status] || STATUS_STYLE['Pending'];
                        const nextStatus = getNextStatus(order.status);
                        const isUpdating = updatingId === order.id;
                        return (
                          <div key={order.id}
                            style={{
                              borderLeft: `4px solid ${order.urgent ? '#ef4444' : st.text}`,
                              // ── NEW: red glow on urgent cards ──
                              boxShadow: order.urgent ? '0 0 0 1px #ef444433, 0 4px 24px #ef444422' : 'none',
                            }}
                            className="bg-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className="text-[#FF6B01] font-bold text-lg">{order.tableNumber || 'No Table'}</span>
                                <span style={{ background: st.bg, color: st.text }} className="text-xs font-bold px-3 py-1 rounded-full">{st.label}</span>
                                <span className="text-gray-500 text-sm">{order.time}</span>
                                {/* ── OrderTimer ── */}
                                <OrderTimer orderId={order.id} status={order.status} />
                                {/* ── UrgentBadge ── */}
                                <UrgentBadge
                                  orderId={order.id}
                                  urgent={!!order.urgent}
                                  token={token}
                                  onToggle={handleUrgentToggle}
                                />
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {order.items ? order.items.map((it, idx) => (
                                  <div key={idx} className="flex flex-col">
                                    <span className="bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-md">
                                      {it.name} ×{it.qty}
                                    </span>
                                    {it.note && (
                                      <span className="text-xs text-amber-400 px-2 mt-0.5">
                                        📝 {it.note}
                                      </span>
                                    )}
                                  </div>
                                )) : <span className="text-gray-300 text-sm">{order.item}</span>}
                              </div>
                              <p className="text-green-400 font-bold m-0">Total: ₹{order.total || '—'}</p>
                              {/* Customer details */}
                              {order.customer?.name && (
                                <div className="mt-2 bg-gray-900 rounded-lg p-2 text-xs text-gray-400 flex flex-col gap-1">
                                  <div className="flex gap-2"><span>👤</span><span className="text-gray-200 font-medium">{order.customer.name}</span></div>
                                  {order.customer.phone && <div className="flex gap-2"><span>📞</span><span>{order.customer.phone}</span></div>}
                                  {order.customer.address && <div className="flex gap-2"><span>📍</span><span>{order.customer.address}</span></div>}
                                </div>
                              )}
                              {/* Payment Management */}
                              <div className="mt-2 bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 font-semibold mb-2">💳 Payment</p>

                                {/* Payment Method */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <span className="text-xs text-gray-400">Method:</span>
                                  {['cash','upi','phonepay'].map(m => {
                                    const icons  = { cash:'💵', upi:'📲', phonepay:'📱' };
                                    const labels = { cash:'Cash', upi:'UPI', phonepay:'PhonePe' };
                                    const isActive = (order.paymentMode || 'cash') === m;
                                    return (
                                      <button key={m}
                                        onClick={async () => {
                                          try {
                                            await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                              body: JSON.stringify({ paymentMode: m })
                                            });
                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentMode: m } : o));
                                          } catch {}
                                        }}
                                        className={`text-xs px-2 py-1 rounded-full border transition font-medium ${isActive ? 'bg-[#FF6B01] text-white border-[#FF6B01]' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}>
                                        {icons[m]} {labels[m]}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Amount Received + Balance Due */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <span className="text-xs text-gray-400 shrink-0">₹ Received:</span>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    defaultValue={order.amountReceived || ''}
                                    onBlur={async (e) => {
                                      const val = Number(e.target.value) || 0;
                                      const newStatus = val >= (order.total || 0) ? 'Paid' : val > 0 ? 'Partial' : order.paymentStatus;
                                      try {
                                        await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ amountReceived: val, paymentStatus: newStatus })
                                        });
                                        setOrders(prev => prev.map(o => o.id === order.id
                                          ? { ...o, amountReceived: val, paymentStatus: newStatus }
                                          : o
                                        ));
                                      } catch {}
                                    }}
                                    style={{
                                      width: 80, padding: '4px 8px',
                                      background: '#1f2937', border: '1px solid #374151',
                                      borderRadius: 6, color: '#f0ece4', fontSize: 12,
                                      outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#FF6B01'}
                                  />
                                  {/* Balance due */}
                                  {order.amountReceived !== undefined && order.amountReceived !== null && (
                                    (() => {
                                      const due = (order.total || 0) - (order.amountReceived || 0);
                                      return due > 0 ? (
                                        <span className="text-xs font-bold text-red-400 bg-red-900 px-2 py-1 rounded-full">
                                          Balance due: ₹{due}
                                        </span>
                                      ) : due === 0 ? (
                                        <span className="text-xs font-bold text-green-400 bg-green-900 px-2 py-1 rounded-full">
                                          ✅ Fully paid
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold text-blue-400 bg-blue-900 px-2 py-1 rounded-full">
                                          Change: ₹{Math.abs(due)}
                                        </span>
                                      );
                                    })()
                                  )}
                                </div>

                                {/* Payment Status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    order.paymentStatus === 'Paid' ? 'bg-green-900 text-green-300' :
                                    order.paymentStatus === 'Partial' ? 'bg-blue-900 text-blue-300' :
                                    'bg-yellow-900 text-yellow-300'
                                  }`}>
                                    {order.paymentStatus === 'Paid' ? '✅ Paid' :
                                     order.paymentStatus === 'Partial' ? '🔵 Partial' : '⏳ Pending'}
                                  </span>
                                  {order.paymentStatus !== 'Paid' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ paymentStatus: 'Paid', amountReceived: order.total })
                                          });
                                          setOrders(prev => prev.map(o => o.id === order.id
                                            ? { ...o, paymentStatus: 'Paid', amountReceived: order.total }
                                            : o
                                          ));
                                        } catch {}
                                      }}
                                      className="text-xs bg-green-800 hover:bg-green-700 text-green-200 px-2 py-1 rounded-full transition font-semibold">
                                      Mark Full Paid ✓
                                    </button>
                                  )}
                                  {order.paymentStatus === 'Paid' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ paymentStatus: 'Unpaid', amountReceived: 0 })
                                          });
                                          setOrders(prev => prev.map(o => o.id === order.id
                                            ? { ...o, paymentStatus: 'Unpaid', amountReceived: 0 }
                                            : o
                                          ));
                                        } catch {}
                                      }}
                                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-full transition">
                                      Undo
                                    </button>
                                  )}
                                </div>

                                {/* Payment Notes / Remark */}
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500 font-semibold">📝 Remark</span>
                                    {order.paymentNote && (
                                      <span className="text-xs text-gray-500 italic">{order.paymentNote.length}/100</span>
                                    )}
                                  </div>
                                  {/* Quick remark chips */}
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {['Baaki kal denge', 'UPI done', 'Cash collected', 'Discount given', 'Split payment'].map(chip => (
                                      <button key={chip}
                                        onClick={async () => {
                                          try {
                                            await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                              body: JSON.stringify({ paymentNote: chip })
                                            });
                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentNote: chip } : o));
                                          } catch {}
                                        }}
                                        className={`text-xs px-2 py-0.5 rounded-full border transition ${
                                          order.paymentNote === chip
                                            ? 'bg-[#FF6B01] text-white border-[#FF6B01]'
                                            : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300'
                                        }`}>
                                        {chip}
                                      </button>
                                    ))}
                                  </div>
                                  {/* Free text input */}
                                  <textarea
                                    placeholder="Custom note... e.g. Baaki kal 11 baje denge"
                                    defaultValue={order.paymentNote || ''}
                                    maxLength={100}
                                    rows={2}
                                    onBlur={async (e) => {
                                      const note = e.target.value.trim();
                                      try {
                                        await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                          body: JSON.stringify({ paymentNote: note })
                                        });
                                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentNote: note } : o));
                                      } catch {}
                                    }}
                                    style={{
                                      width: '100%', boxSizing: 'border-box',
                                      padding: '6px 10px', resize: 'none',
                                      background: '#1f2937', border: '1px solid #374151',
                                      borderRadius: 6, color: '#f0ece4', fontSize: 12,
                                      outline: 'none', lineHeight: 1.5
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#FF6B01'}
                                  />
                                  {/* Show saved note as badge */}
                                  {order.paymentNote && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-amber-400 bg-amber-900 px-2 py-0.5 rounded-full">
                                        📝 {order.paymentNote}
                                      </span>
                                      <button
                                        onClick={async () => {
                                          try {
                                            await fetch(`${import.meta.env.VITE_API_URL}/api/order/${order.id}/payment`, {
                                              method: 'PATCH',
                                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                              body: JSON.stringify({ paymentNote: '' })
                                            });
                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paymentNote: '' } : o));
                                          } catch {}
                                        }}
                                        className="text-xs text-gray-500 hover:text-red-400 transition">
                                        ✕ clear
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 min-w-[160px]">
                              <div className="flex items-center gap-1 mb-1">
                                {STATUS_FLOW.map((s, idx) => {
                                  const ci = STATUS_FLOW.indexOf(order.status);
                                  return (
                                    <div key={s} className="flex items-center gap-1">
                                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: idx <= ci ? STATUS_STYLE[s].text : '#374151' }} />
                                      {idx < STATUS_FLOW.length - 1 && <div style={{ width: 14, height: 2, background: idx < ci ? '#FF6B01' : '#374151' }} />}
                                    </div>
                                  );
                                })}
                              </div>
                              {nextStatus
                                ? <button onClick={() => handleStatusChange(order.id, nextStatus)} disabled={isUpdating}
                                    style={{ background: STATUS_STYLE[nextStatus].bg, color: STATUS_STYLE[nextStatus].text }}
                                    className="text-sm font-bold px-4 py-2 rounded-lg hover:opacity-80 disabled:opacity-50">
                                    {isUpdating ? t.updating : `${t.markAs} ${nextStatus} →`}
                                  </button>
                                : <span className="text-gray-500 text-sm text-center py-2">{t.complete}</span>}
                              <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} disabled={isUpdating}
                                className="bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 border border-gray-600 cursor-pointer">
                                {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                              </select>
                              <button onClick={() => setBillOrder(order)} className="bg-gray-700 hover:bg-gray-600 transition text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                                {t.printBill}
                              </button>
                              {order.status !== 'Delivered' && (
                                <button onClick={() => setEditOrder(order)} className="bg-blue-800 hover:bg-blue-700 transition text-white text-xs px-3 py-1.5 rounded-lg font-semibold">
                                  ✏️ Edit Order
                                </button>
                              )}
                              {order.status !== 'Delivered' && (
                                <button onClick={() => handleCancelOrder(order.id)} className="bg-red-900 hover:bg-red-700 transition text-red-300 hover:text-white text-xs px-3 py-1.5 rounded-lg font-semibold border border-red-700">
                                  ❌ {t.cancelOrder}
                                </button>
                              )}
                              {/* Customer Rating Display */}
                              {order.rating?.overall && (
                                <div style={{
                                  background: '#1a1000', border: '1px solid #3a1f00',
                                  borderRadius: 8, padding: '8px 12px', marginTop: 4
                                }}>
                                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#a08060', fontWeight: 700 }}>⭐ Customer Rating</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <span style={{ color: '#FF6B01', fontSize: 16, letterSpacing: 1 }}>
                                      {'★'.repeat(order.rating.overall)}{'☆'.repeat(5 - order.rating.overall)}
                                    </span>
                                    <span style={{ color: '#fde68a', fontSize: 12, fontWeight: 700 }}>{order.rating.overall}/5</span>
                                  </div>
                                  {order.rating.comment && (
                                    <p style={{ margin: 0, fontSize: 11, color: '#d1d5db', fontStyle: 'italic' }}>"{order.rating.comment}"</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}

            {/* Menu */}
            {adminTab === 'menu' && (
              <div>
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-[#FFD700] mb-5">{t.addNewItem}</h3>
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <div onClick={() => fileInputRef.current?.click()} style={{ width: 90, height: 90, borderRadius: 10, border: '2px dashed #4b5563', background: '#111', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:border-[#FF6B01] transition">
                        {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28, opacity: 0.4 }}>📷</span>}
                      </div>
                      <span className="text-xs text-gray-500">{t.photo}</span>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
                    </div>
                    <div className="flex flex-wrap gap-3 items-end flex-1">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Item Name</label>
                        <input type="text" placeholder="e.g. Chole Bhature" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B01] w-48" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Price (₹)</label>
                        <input type="number" placeholder="e.g. 150" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B01] w-32" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">Category</label>
                        <input type="text" placeholder="e.g. Snacks" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B01] w-44" />
                      </div>
                      <button onClick={handleAddItem} className="bg-[#FF6B01] hover:bg-orange-500 transition px-5 py-2 rounded font-bold text-white">+ Add</button>
                    </div>
                  </div>
                  {addError && <p className="text-red-400 text-sm mt-2">{addError}</p>}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{t.currentMenu}</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-700">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-800 text-gray-400 text-sm">
                        <th className="py-3 px-4">{t.photo}</th><th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Item Name</th><th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th><th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.length === 0
                        ? <tr><td colSpan={6} className="py-6 text-center text-gray-500">{t.noMenuItems}</td></tr>
                        : menuItems.map((item, i) => (
                          <tr key={item.id} className="border-t border-gray-800 hover:bg-gray-800 transition">
                            <td className="py-2 px-4">
                              <div style={{ position: 'relative', width: 52, height: 52 }}>
                                {item.image
                                  ? <img src={`${import.meta.env.VITE_API_URL}${item.image}`} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', border: '1px solid #374151' }} />
                                  : <div style={{ width: 52, height: 52, borderRadius: 8, background: '#1e1e1e', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, opacity: 0.4 }}>🍽️</div>}
                                <div onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = e => handleRowImageUpload(item.id, e.target.files[0]); inp.click(); }}
                                  style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                                  className="hover:opacity-100" title={t.changePhoto}>
                                  {uploadingId === item.id ? '⏳' : '📷'}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                            <td className="py-3 px-4 font-medium">{item.name}</td>
                            <td className="py-3 px-4 text-gray-300">{item.category}</td>
                            <td className="py-3 px-4 text-green-400 font-semibold">₹{item.price}</td>
                            <td className="py-3 px-4">
                              <button onClick={() => handleDeleteItem(item.id)} className="bg-red-700 hover:bg-red-500 transition text-white text-sm px-3 py-1 rounded">🗑️ Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* History */}
            {adminTab === 'history' && (
              <TableHistory token={token} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Theme-aware shell: has access to ThemeProvider context ─────────────────
function AppShell({ children }) {
  const { theme } = useTheme();
  return (
    <div style={{ background: theme.bg, minHeight: '100vh', color: theme.text, transition: 'background 0.25s, color 0.25s' }}>
      {children}
    </div>
  );
}

function AppWithTheme() {
  return (
    <ThemeProvider>
      <AppShell>
        <App />
      </AppShell>
    </ThemeProvider>
  );
}

export default AppWithTheme;