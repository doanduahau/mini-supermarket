require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
mongoose.connect(process.env.MONGODB_URI);
const User = require('./src/models/User');

async function test() {
  const user = await User.findOne({ role: 'employee' });
  console.log('Testing User ID:', user._id.toString());
  
  // Create a token for admin
  const admin = await User.findOne({ role: 'supermarket_owner' });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

  // Now fetch using the exact fetch code
  try {
    const res = await fetch(`http://localhost:5000/api/users/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch(e) {
    console.error('Fetch error:', e.message);
  }
  process.exit();
}
test();
