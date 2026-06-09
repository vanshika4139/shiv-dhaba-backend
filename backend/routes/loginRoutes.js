const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const fs      = require('fs');
const path    = require('path');
const nodemailer = require('nodemailer');

const usersFile  = path.join(__dirname, '../users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'shivdhaba_super_secret_key_2024';

const readUsers  = () => JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
const writeUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// OTP store (in-memory)
const otpStore = {};

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

// POST /api/auth/forgot-password — OTP bhejo
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const users = readUsers();
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) return res.status(404).json({ error: 'Email registered nahi hai' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.toLowerCase()] = { otp, expires: Date.now() + 10 * 60 * 1000 };

    await transporter.sendMail({
      from: `"Shiv Dhaba" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Shiv Dhaba — Password Reset OTP',
      html: `
        <div style="font-family: Arial; padding: 20px; background: #fff8f0; border-radius: 10px;">
          <h2 style="color: #e65c00;">🍽️ Shiv Dhaba</h2>
          <p>Aapka OTP code hai:</p>
          <h1 style="color: #e65c00; letter-spacing: 5px;">${otp}</h1>
          <p>Ye OTP 10 minute mein expire ho jayega.</p>
        </div>
      `
    });

    res.json({ message: 'OTP bhej diya gaya!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP bhejne mein problem aayi' });
  }
});

// POST /api/auth/verify-otp — OTP verify karo
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email?.toLowerCase()];

  if (!record) return res.status(400).json({ error: 'OTP nahi mila, dobara bhejo' });
  if (Date.now() > record.expires) return res.status(400).json({ error: 'OTP expire ho gaya' });
  if (record.otp !== otp) return res.status(400).json({ error: 'Galat OTP' });

  res.json({ message: 'OTP sahi hai!' });
});

// POST /api/auth/reset-password — naya password set karo
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore[email?.toLowerCase()];

    if (!record) return res.status(400).json({ error: 'OTP nahi mila' });
    if (Date.now() > record.expires) return res.status(400).json({ error: 'OTP expire ho gaya' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Galat OTP' });

    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());
    if (userIndex === -1) return res.status(404).json({ error: 'User nahi mila' });

    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);
    delete otpStore[email.toLowerCase()];

    res.json({ message: 'Password reset ho gaya!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware — token verify karo
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