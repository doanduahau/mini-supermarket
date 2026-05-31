require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const ShiftAssignment = mongoose.model('ShiftAssignment', new mongoose.Schema({}, { strict: false }));
async function test() {
  const d = new Date('2026-06-01T00:00:00.000Z');
  const end = new Date('2026-06-01T23:59:59.999Z');
  const count = await ShiftAssignment.countDocuments({ date: { $gte: d, $lte: end } });
  console.log('Total assignments on June 1st:', count);
  const docs = await ShiftAssignment.find({ date: { $gte: d, $lte: end } });
  console.log(docs);
  process.exit();
}
test();
