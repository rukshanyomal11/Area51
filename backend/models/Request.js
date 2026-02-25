const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  items: [{ title: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', requestSchema);