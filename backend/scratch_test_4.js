require('dotenv').config();
const { sequelize } = require('./src/config/db');
const { User } = require('./src/models');

async function test() {
  await sequelize.authenticate();
  
  const user = await User.findOne({ where: { role: 'employee' } });
  console.log('Testing User ID:', user.id);
  
  const admin = await User.scope('withPassword').findOne({ where: { role: 'supermarket_owner' } });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ userId: admin.id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

  try {
    const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch(e) {
    console.error('Fetch error:', e.message);
  }
  
  await sequelize.close();
  process.exit();
}
test();
