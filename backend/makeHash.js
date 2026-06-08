// Apna password hash karne ke liye ek baar run karo
// node hashPassword.js
const bcrypt = require('bcryptjs');

const password = 'vanshika3926'; // <-- yahan apna password likho

bcrypt.hash(password, 10, (err, hash) => {
  if (err) { console.error(err); return; }
  console.log('\n✅ Hashed password:\n');
  console.log(hash);
  console.log('\nYeh hash users.json mein "password" field mein daalo\n');
});