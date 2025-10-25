const Counter = require('../models/Counter');

/**
 * Generate next sequential order number
 * @returns {Promise<string>} Order number in format ORD000001
 */
async function generateOrderNumber() {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'orderNumber',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return `ORD${counter.seq.toString().padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback to timestamp-based if counter fails
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}

/**
 * Get current order number count
 * @returns {Promise<number>} Current counter value
 */
async function getCurrentOrderCount() {
  try {
    const counter = await Counter.findById('orderNumber');
    return counter ? counter.seq : 0;
  } catch (error) {
    console.error('Error getting order count:', error);
    return 0;
  }
}

/**
 * Reset order counter (use with caution!)
 * @param {number} value - Value to set counter to
 * @returns {Promise<number>} New counter value
 */
async function resetOrderCounter(value = 0) {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'orderNumber',
      { seq: value },
      { new: true, upsert: true }
    );
    return counter.seq;
  } catch (error) {
    console.error('Error resetting order counter:', error);
    throw error;
  }
}

module.exports = {
  generateOrderNumber,
  getCurrentOrderCount,
  resetOrderCounter
};