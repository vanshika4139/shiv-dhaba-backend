import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(user, onNewOrder, onStatusUpdate, onOrderCancelled, onUrgentUpdate) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user !== 'admin') return;

    const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect',    () => { console.log('✅ Socket connected'); setConnected(true); });
    socket.on('disconnect', () => { console.log('❌ Socket disconnected'); setConnected(false); });

    // Naya order aaya
    socket.on('new_order', (order) => {
      onNewOrder && onNewOrder(order);
    });

    // Status update aaya
    socket.on('order_status_update', ({ id, status }) => {
      onStatusUpdate && onStatusUpdate(id, status);
    });

    // Order cancel hua
    socket.on('order_cancelled', ({ id }) => {
      onOrderCancelled && onOrderCancelled(id);
    });

    // ── NEW: urgent flag update aaya ──
    socket.on('order_urgent', ({ id, urgent }) => {
      onUrgentUpdate && onUrgentUpdate(id, urgent);
    });

    return () => socket.disconnect();
  }, [user]);

  return { connected };
}