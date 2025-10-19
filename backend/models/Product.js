const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imageSrc: { type: String, required: true },
  size: { type: [String], required: true }, // Array of sizes
  color: { type: [String], required: true }, // Array of colors
  brand: { type: String, required: true },
  material: { type: String, required: true },
  length: { type: [String], required: true }, // Array of lengths
  style: { type: String, required: true },
  category: { type: String, enum: ['Men', 'Women'], required: true },
});

module.exports = mongoose.model('Product', productSchema);