const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imageSrc: { type: String, required: true },
  size: { type: String, required: true },
  length: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', cartSchema);