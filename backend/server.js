const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ─── In-Memory Data ───────────────────────────────────────────────────────────
let menuItems = [
  { _id:'1',  name:'Paneer Tikka Roll',      price:140, category:'Snacks',    isAvailable:true },
  { _id:'2',  name:'Frenky Roll',            price:120, category:'Snacks',    isAvailable:true },
  { _id:'3',  name:'Veg. Cutlet',            price:80,  category:'Snacks',    isAvailable:true },
  { _id:'4',  name:'Naram Dil Kabab',        price:180, category:'Snacks',    isAvailable:true },
  { _id:'5',  name:'Paneer Tikka',           price:230, category:'Snacks',    isAvailable:true },
  { _id:'6',  name:'Paneer Malai Tikka',     price:190, category:'Snacks',    isAvailable:true },
  { _id:'7',  name:'Paneer Achari Tikka',    price:210, category:'Snacks',    isAvailable:true },
  { _id:'8',  name:'Veg. Seekh Kabab',       price:180, category:'Snacks',    isAvailable:true },
  { _id:'9',  name:'Afgani Chaap',           price:180, category:'Snacks',    isAvailable:true },
  { _id:'10', name:'Malai Chaap',            price:190, category:'Snacks',    isAvailable:true },
  { _id:'11', name:'SD Spl. Chaap',          price:240, category:'Snacks',    isAvailable:true },
  { _id:'12', name:'Paneer Chilly',          price:180, category:'Snacks',    isAvailable:true },
  { _id:'13', name:'Mashroom Chilly',        price:190, category:'Snacks',    isAvailable:true },
  { _id:'14', name:'Chana Chilly',           price:170, category:'Snacks',    isAvailable:true },
  { _id:'15', name:'Corn Salt N Pepper',     price:180, category:'Snacks',    isAvailable:true },
  { _id:'16', name:'French Fries',           price:110, category:'Snacks',    isAvailable:true },
  { _id:'17', name:'Honey Chilly Potato',    price:120, category:'Snacks',    isAvailable:true },
  { _id:'18', name:'Spring Roll',            price:100, category:'Snacks',    isAvailable:true },
  { _id:'19', name:'Cheese Corn Roll',       price:140, category:'Snacks',    isAvailable:true },
  { _id:'20', name:'Veg. Burger',            price:60,  category:'Snacks',    isAvailable:true },
  { _id:'21', name:'Cheese Burger',          price:80,  category:'Snacks',    isAvailable:true },
  { _id:'22', name:'Aloo Puri',              price:115, category:'Breakfast', isAvailable:true },
  { _id:'23', name:'Mix Pakoda',             price:170, category:'Breakfast', isAvailable:true },
  { _id:'24', name:'Bread Pakoda',           price:60,  category:'Breakfast', isAvailable:true },
  { _id:'25', name:'Paneer Pakoda',          price:130, category:'Breakfast', isAvailable:true },
  { _id:'26', name:'Chole Bhature',          price:120, category:'Breakfast', isAvailable:true },
  { _id:'27', name:'Paav Bhaji',             price:80,  category:'Breakfast', isAvailable:true },
  { _id:'28', name:'Aloo Prantha',           price:50,  category:'Breakfast', isAvailable:true },
  { _id:'29', name:'Paneer Prantha',         price:70,  category:'Breakfast', isAvailable:true },
  { _id:'30', name:'Aloo Pyaz Prantha',      price:50,  category:'Breakfast', isAvailable:true },
  { _id:'31', name:'Mix Prantha',            price:80,  category:'Breakfast', isAvailable:true },
  { _id:'32', name:'Sandwich Grill',         price:90,  category:'Breakfast', isAvailable:true },
  { _id:'33', name:'Cheese Sandwich',        price:110, category:'Breakfast', isAvailable:true },
  { _id:'34', name:'Dum Aloo Punjabi',       price:160, category:'Indian',    isAvailable:true },
  { _id:'35', name:'Dum Aloo Banarsi',       price:180, category:'Indian',    isAvailable:true },
  { _id:'36', name:'Dum Aloo Kashmiri',      price:190, category:'Indian',    isAvailable:true },
  { _id:'37', name:'Aloo Matar',             price:150, category:'Indian',    isAvailable:true },
  { _id:'38', name:'Methi Malai Paneer',     price:200, category:'Indian',    isAvailable:true },
  { _id:'39', name:'Methi Malai Matar',      price:180, category:'Indian',    isAvailable:true },
  { _id:'40', name:'Aloo Methi',             price:160, category:'Indian',    isAvailable:true },
  { _id:'41', name:'Matar Paneer',           price:170, category:'Indian',    isAvailable:true },
  { _id:'42', name:'Kadhai Paneer',          price:200, category:'Indian',    isAvailable:true },
  { _id:'43', name:'Shahi Paneer',           price:180, category:'Indian',    isAvailable:true },
  { _id:'44', name:'Paneer Bhurji',          price:220, category:'Indian',    isAvailable:true },
  { _id:'45', name:'Paneer Do Pyaza',        price:180, category:'Indian',    isAvailable:true },
  { _id:'46', name:'Paneer Tadka Masala',    price:190, category:'Indian',    isAvailable:true },
  { _id:'47', name:'Paneer Khurchan',        price:210, category:'Indian',    isAvailable:true },
  { _id:'48', name:'Paneer Tikka Masala',    price:220, category:'Indian',    isAvailable:true },
  { _id:'49', name:'Palak Paneer',           price:200, category:'Indian',    isAvailable:true },
  { _id:'50', name:'Mix Veg.',               price:160, category:'Indian',    isAvailable:true },
  { _id:'51', name:'Veg. Kadhai',            price:170, category:'Indian',    isAvailable:true },
  { _id:'52', name:'Veg. Kohla Puri',        price:170, category:'Indian',    isAvailable:true },
  { _id:'53', name:'Veg. Maratha',           price:160, category:'Indian',    isAvailable:true },
  { _id:'54', name:'Veg. Diwani Handi',      price:180, category:'Indian',    isAvailable:true },
  { _id:'55', name:'Veg. Hyderabadi',        price:170, category:'Indian',    isAvailable:true },
  { _id:'56', name:'Veg. Sada Bahar',        price:180, category:'Indian',    isAvailable:true },
  { _id:'57', name:'Veg. Sabnami',           price:180, category:'Indian',    isAvailable:true },
  { _id:'58', name:'Veg. Tawa',              price:190, category:'Indian',    isAvailable:true },
  { _id:'59', name:'Veg. Kofta',             price:160, category:'Indian',    isAvailable:true },
  { _id:'60', name:'Dhingri Kofta',          price:180, category:'Indian',    isAvailable:true },
  { _id:'61', name:'Dal Tadka',              price:140, category:'Indian',    isAvailable:true },
  { _id:'62', name:'Dal Makhni',             price:160, category:'Indian',    isAvailable:true },
  { _id:'63', name:'Veg. Fried Rice',        price:160, category:'Rice',      isAvailable:true },
  { _id:'64', name:'Steam Rice',             price:70,  category:'Rice',      isAvailable:true },
  { _id:'65', name:'Zeera Rice',             price:90,  category:'Rice',      isAvailable:true },
  { _id:'66', name:'Thai Chilly Fried Rice', price:200, category:'Rice',      isAvailable:true },
  { _id:'67', name:'Veg. Pulao',             price:150, category:'Rice',      isAvailable:true },
  { _id:'68', name:'Tripple Fried Rice',     price:200, category:'Rice',      isAvailable:true },
  { _id:'69', name:'Veg. Biryani',           price:160, category:'Rice',      isAvailable:true },
  { _id:'70', name:'Veg. Hyderabadi Rice',   price:170, category:'Rice',      isAvailable:true },
  { _id:'71', name:'Kashmiri Pulao',         price:180, category:'Rice',      isAvailable:true },
  { _id:'72', name:'Plain Roti',             price:10,  category:'Tandoor',   isAvailable:true },
  { _id:'73', name:'Butter Roti',            price:15,  category:'Tandoor',   isAvailable:true },
  { _id:'74', name:'Plain Naan',             price:35,  category:'Tandoor',   isAvailable:true },
  { _id:'75', name:'Butter Naan',            price:35,  category:'Tandoor',   isAvailable:true },
  { _id:'76', name:'Stuff Naan',             price:40,  category:'Tandoor',   isAvailable:true },
  { _id:'77', name:'Laccha Prantha',         price:25,  category:'Tandoor',   isAvailable:true },
  { _id:'78', name:'Chilly Prantha Red',     price:30,  category:'Tandoor',   isAvailable:true },
  { _id:'79', name:'Chilly Prantha Green',   price:30,  category:'Tandoor',   isAvailable:true },
  { _id:'80', name:'Mix Raita',              price:80,  category:'Raita',     isAvailable:true },
  { _id:'81', name:'Boondi Raita',           price:60,  category:'Raita',     isAvailable:true },
  { _id:'82', name:'Fruit Raita',            price:100, category:'Raita',     isAvailable:true },
  { _id:'83', name:'Plain Curd',             price:50,  category:'Raita',     isAvailable:true },
  { _id:'84', name:'Veg. Manchow Soup',      price:70,  category:'Soup',      isAvailable:true },
  { _id:'85', name:'Veg. Clear Soup',        price:60,  category:'Soup',      isAvailable:true },
  { _id:'86', name:'Lemon Coriander Soup',   price:90,  category:'Soup',      isAvailable:true },
  { _id:'87', name:'Hot N Sour Soup',        price:80,  category:'Soup',      isAvailable:true },
  { _id:'88', name:'Veg. Hakka Noodles',     price:110, category:'Noodles',   isAvailable:true },
  { _id:'89', name:'Schezwan Noodles',       price:140, category:'Noodles',   isAvailable:true },
  { _id:'90', name:'Veg. Noodles',           price:90,  category:'Noodles',   isAvailable:true },
  { _id:'91', name:'Veg. Singapori Noodles', price:140, category:'Noodles',   isAvailable:true },
  { _id:'92', name:'Chilly Garlic Noodles',  price:130, category:'Noodles',   isAvailable:true },
  { _id:'93', name:'Hot Coffee',             price:35,  category:'Beverages', isAvailable:true },
  { _id:'94', name:'Cold Coffee',            price:50,  category:'Beverages', isAvailable:true },
  { _id:'95', name:'Tea',                    price:20,  category:'Beverages', isAvailable:true },
  { _id:'96', name:'Lassi',                  price:0,   category:'Beverages', isAvailable:true },
  { _id:'97', name:'Salt N Sweet Lassi',     price:0,   category:'Beverages', isAvailable:true },
  { _id:'98', name:'Fresh Lime Soda',        price:0,   category:'Beverages', isAvailable:true },
  { _id:'99', name:'Gajar Halwa',            price:35,  category:'Sweets',    isAvailable:true },
  { _id:'100',name:'Rasmalai',               price:50,  category:'Sweets',    isAvailable:true },
  { _id:'101',name:'Gulab Jamun',            price:20,  category:'Sweets',    isAvailable:true },
  { _id:'102',name:'Ice Cream',              price:0,   category:'Sweets',    isAvailable:true },
];

let orders = [];
let nextMenuId = 103;
let nextOrderId = 1;

// ─── MENU ROUTES ──────────────────────────────────────────────────────────────
app.get('/api/menu', (req, res) => res.json(menuItems));

app.get('/api/menu/:id', (req, res) => {
  const item = menuItems.find(i => i._id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/menu', (req, res) => {
  const item = { _id: String(nextMenuId++), ...req.body, isAvailable: req.body.isAvailable !== false };
  menuItems.push(item);
  res.status(201).json(item);
});

app.put('/api/menu/:id', (req, res) => {
  const idx = menuItems.findIndex(i => i._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  menuItems[idx] = { ...menuItems[idx], ...req.body };
  res.json(menuItems[idx]);
});

app.delete('/api/menu/:id', (req, res) => {
  menuItems = menuItems.filter(i => i._id !== req.params.id);
  res.json({ success: true });
});

// ─── ORDER ROUTES ─────────────────────────────────────────────────────────────
app.get('/api/orders', (req, res) => res.json([...orders].reverse()));

app.post('/api/orders', (req, res) => {
  const order = { _id: String(nextOrderId++), ...req.body, status: req.body.status || 'Pending', paid: false, createdAt: new Date() };
  orders.push(order);
  res.status(201).json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  orders[idx] = { ...orders[idx], ...req.body };
  res.json(orders[idx]);
});

app.delete('/api/orders/:id', (req, res) => {
  orders = orders.filter(o => o._id !== req.params.id);
  res.json({ success: true });
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
  const active = orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = active.filter(o => o.paid).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const today = new Date();
  const todayOrders = active.filter(o => {
    const d = new Date(o.createdAt);
    return d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear();
  });
  const todayRevenue = todayOrders.filter(o => o.paid).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const itemCount = {};
  active.forEach(o => (o.items || []).forEach(i => { itemCount[i.name] = (itemCount[i.name] || 0) + i.quantity; }));
  const popular = Object.entries(itemCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,count])=>({name,count}));
  res.json({ totalOrders: active.length, totalRevenue, todayOrders: todayOrders.length, todayRevenue, popular });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(1500, () => console.log('Shiv Dhaba server running on port 1500'));
