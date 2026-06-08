const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  tableNumber:    { type: String, required: true },
  items:          [orderItemSchema],
  total:          { type: Number, required: true },
  status:         { type: String, default: 'Pending' },
  paymentStatus:  { type: String, default: 'Unpaid' },
  paymentMode:    { type: String, default: '' },
  amountReceived: { type: Number, default: 0 },
  paymentNote:    { type: String, default: '' },
  urgent:         { type: Boolean, default: false },
  urgentAt:       { type: String, default: null },
  edited:         { type: Boolean, default: false },
  rating:         { type: Object, default: null },
  time:           { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);