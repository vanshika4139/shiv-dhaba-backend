const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const fs      = require('fs');
const path    = require('path');
const nodemailer = require('nodemailer'); // NodeMailer ko include kiya

const usersFile  = path.join(__dirname, '../users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'shivdhaba_super_secret_key_2024';

const readUsers  = () => JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
const writeUsers = (data) => fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));

// =========================================================
// 1. POST /api/auth/login
// =========================================================
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

// =========================================================
// 2. POST /api/auth/register
// =========================================================
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

// =========================================================
// 3. POST /api/auth/forgot-password (OTP BHEJNE KE LIYE)
// =========================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email.toLowerCase());

    if (userIndex === -1) {
      return res.status(404).json({ message: 'This email is not registered!' });
    }

    // 6-Digit Secret OTP Generate karein
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // JSON array ke andar temporary store karein (15 mins valid)
    users[userIndex].resetOTP = otp;
    users[userIndex].resetOTPExpires = Date.now() + 15 * 60 * 1000;
    writeUsers(users);

    // Nodemailer Email Mailer Setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vanshika3926@gmail.com', // Aapka account email
        pass: process.env.EMAIL_PASS   // Render Server setting ka dynamic password
      }
    });

    const mailOptions = {
      from: 'vanshika3926@gmail.com',
      to: users[userIndex].email,
      subject: '🔑 Shiv Dhaba - Admin Password Reset OTP',
      text: `Dear Admin,\n\nApna dashboard password badalne ke liye aapka verification OTP ye hai: ${otp}.\n\nYe code agle 15 minutes tak hi kaam karega.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

// =========================================================
// 4. POST /api/auth/reset-password (OTP VERIFY & SAVE)
// =========================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All inputs are required' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => 
      u.email === email.toLowerCase() && 
      u.resetOTP === otp && 
      u.resetOTPExpires > Date.now()
    );

    if (userIndex === -1) {
      return res.status(400).json({ message: 'Invalid OTP or code has expired!' });
    }

    // Naye password ko bcrypt se encrypt/hash karein
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // User fields update karein aur OTP saaf kar dein
    users[userIndex].password = hashedNewPassword;
    delete users[userIndex].resetOTP;
    delete users[userIndex].resetOTPExpires;
    
    writeUsers(users);

    res.status(200).json({ message: 'Password reset successful!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error while resetting password' });
  }
});

// =========================================================
// Middleware — token verify
// =========================================================
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