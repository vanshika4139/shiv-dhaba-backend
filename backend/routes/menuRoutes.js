const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const menuFile = path.join(__dirname, '../menu.json');

// Uploads folder banao agar nahi hai
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config — image save karo uploads/ mein
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `item_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sirf image files allowed hain'));
  }
});

const readMenu  = () => JSON.parse(fs.readFileSync(menuFile, 'utf-8'));
const writeMenu = (data) => fs.writeFileSync(menuFile, JSON.stringify(data, null, 2));

// GET - saare items
router.get('/', (req, res) => {
  try { res.json(readMenu()); }
  catch { res.status(500).json({ error: 'Menu load nahi hua' }); }
});

// POST - naya item add (with optional image)
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category)
      return res.status(400).json({ error: 'Sabhi fields required hain' });

    const items = readMenu();
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      image: req.file ? `/uploads/${req.file.filename}` : null,
    };
    items.push(newItem);
    writeMenu(items);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Item add nahi hua' });
  }
});

// PATCH - sirf image update karo
router.patch('/:id/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image nahi mili' });
    const id = Number(req.params.id);
    const items = readMenu();
    const item = items.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Item nahi mila' });

    // Purani image delete karo
    if (item.image) {
      const old = path.join(__dirname, '..', item.image);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    item.image = `/uploads/${req.file.filename}`;
    writeMenu(items);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - item hatao
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const items = readMenu();
    const item = items.find(i => i.id === id);

    // Image bhi delete karo
    if (item?.image) {
      const imgPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    writeMenu(items.filter(i => i.id !== id));
    res.json({ message: 'Item delete ho gaya' });
  } catch { res.status(500).json({ error: 'Item delete nahi hua' }); }
});

module.exports = router;