const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const fs      = require('fs');
const path    = require('path');

const usersFile  = path.join(__dirname, '../users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'shivdhaba_super_secret_key_2024';

const readUsers  = () => JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
const writeUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Please enter email and password' });

    const users = readUsers();
    const user  = users.find(u => u.email === email.toLowerCase());
    if (!user)
      return res.status(401).json({ error: 'Email or password is incorrect' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Email or password is incorrect' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const users = readUsers();
    if (users.find(u => u.email === email.toLowerCase()))
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(), name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user'
    };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json({ message: 'User registered!', user: { id: newUser.id, name, email, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware — token verify
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token not found' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = decoded;
    next();
  });
}

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { router, verifyToken };