require('dotenv').config();
const connectDB = require('./config/db');
connectDB();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const http       = require('http');
const { Server } = require('socket.io');
const Order      = require('./models/Order');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Disconnected:', socket.id));
});

// Auth Routes
const { router: authRouter, verifyToken } = require('./routes/loginRoutes');
app.use('/api/auth', authRouter);

// GET all active orders (admin)
app.get('/api/orders', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const orders = await Order.find({ status: { $nin: ['Delivered', 'Cancelled'] } }).sort({ createdAt: -1 });
  res.json(orders);
});

// POST new order
app.post('/api/order', async (req, res) => {
  const order = await Order.create({
    ...req.body,
    time: req.body.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending'
  });
  io.emit('new_order', order);
  res.json({ message: 'Order Placed Successfully!', order });
});

// PATCH order status
app.patch('/api/order/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ error: 'Order nahi mila' });
  io.emit('order_status_update', { id: order._id, status });
  res.json({ message: 'Status update ho gaya', order });
});

// PATCH edit order items
app.patch('/api/order/:id/edit', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { items, total } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { items, total, edited: true }, { new: true });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  io.emit('order_edited', { id: order._id, items, total });
  res.json({ message: 'Order updated', order });
});

// PATCH payment
app.patch('/api/order/:id/payment', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { paymentStatus, paymentMode, amountReceived, paymentNote } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, 
    { paymentStatus, paymentMode, amountReceived, paymentNote }, { new: true });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  io.emit('payment_update', { id: order._id, paymentStatus, paymentMode, amountReceived });
  res.json({ message: 'Payment updated', order });
});

// PATCH urgent
app.patch('/api/order/:id/urgent', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.urgent   = !order.urgent;
  order.urgentAt = order.urgent ? new Date().toISOString() : null;
  await order.save();
  io.emit('order_urgent', { id: order._id, urgent: order.urgent });
  res.json({ message: `Order marked ${order.urgent ? '🚨 URGENT' : 'normal'}`, order });
});

// DELETE cancel order
app.delete('/api/order/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    verifyToken(req, res, async () => {
      if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
      await Order.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
      io.emit('order_cancelled', { id: req.params.id });
      res.json({ message: 'Order cancelled', order });
    });
  } else {
    if (order.status !== 'Pending') return res.status(400).json({ error: `Order ${order.status} hai, cancel nahi ho sakta` });
    await Order.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
    io.emit('order_cancelled', { id: req.params.id });
    res.json({ message: 'Order cancelled', order });
  }
});

// GET order history (admin)
app.get('/api/history', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { table } = req.query;
  const filter = { status: { $in: ['Delivered', 'Cancelled'] } };
  if (table) filter.tableNumber = String(table);
  const orders = await Order.find(filter).sort({ updatedAt: -1 });
  res.json(orders);
});

// GET table summary
app.get('/api/history/summary', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const orders = await Order.find({ status: { $in: ['Delivered', 'Cancelled'] } });
  const summary = {};
  orders.forEach(o => {
    const t = String(o.tableNumber);
    if (!summary[t]) summary[t] = { table: t, orderCount: 0, totalSpent: 0, lastOrder: null };
    summary[t].orderCount++;
    if (o.status === 'Delivered') summary[t].totalSpent += Number(o.total) || 0;
    const d = o.updatedAt?.toISOString();
    if (!summary[t].lastOrder || d > summary[t].lastOrder) summary[t].lastOrder = d;
  });
  res.json(Object.values(summary).sort((a, b) => b.totalSpent - a.totalSpent));
});

// GET single order tracking
app.get('/api/order/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST rating
app.post('/api/order/:id/rating', async (req, res) => {
  const { overallRating, itemRatings, comment } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id,
    { rating: { overall: overallRating, items: itemRatings, comment, ratedAt: new Date().toISOString() } },
    { new: true });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, order });
});

// Menu Routes
const menuRoutes = require('./routes/menuRoutes');
app.use('/api/menu', menuRoutes);

server.listen(process.env.PORT || 1500, () => console.log(`🚀 Server running on port ${process.env.PORT || 1500}`));