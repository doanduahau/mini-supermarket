require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
mongoose.connect(process.env.MONGODB_URI);
const ShiftAssignment = mongoose.model('ShiftAssignment', new mongoose.Schema({}, { strict: false }));
const Shift = mongoose.model('Shift', new mongoose.Schema({}, { strict: false }));
async function test() {
  const shift = await Shift.findOne({ name: 'Ca chiều' });
  const docs = await ShiftAssignment.find({ date: { $gte: new Date('2026-06-03T00:00:00Z'), $lte: new Date('2026-06-03T23:59:59Z') }, status: { $in: ['pending', 'approved'] }, shift: shift._id });
  console.log('Total on June 3:', docs.length);
  process.exit();
}
test();
