require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const ShiftAssignment = mongoose.model('ShiftAssignment', new mongoose.Schema({}, { strict: false }));
async function test() {
  const ass = await ShiftAssignment.findOne({ status: 'pending' });
  console.log(ass);
  process.exit();
}
test();
