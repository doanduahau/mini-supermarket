require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const ShiftAssignment = mongoose.model('ShiftAssignment', new mongoose.Schema({}, { strict: false }));
async function test() {
  const docs = await ShiftAssignment.find({ date: { $gte: new Date('2026-06-01') } }).sort({ date: 1 });
  console.log('Dates found:', [...new Set(docs.map(d => d.date.toISOString().split('T')[0]))]);
  process.exit();
}
test();
