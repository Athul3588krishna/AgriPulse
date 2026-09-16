const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Unit' },
  outsidePrice: { type: Number, required: true },
  factoryPrice: { type: Number, required: true },
  commissionPerUnit: { type: Number, required: true },
  finalUnitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  totalCommission: { type: Number, required: true },
  totalSavings: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  buyerType: { type: String, enum: ['farmer', 'fpo'], default: 'farmer' },
  fpoName: { type: String, default: '' },
  buyerName: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  district: { type: String, default: 'Palakkad' },
  items: [orderItemSchema],
  totalFactoryCost: { type: Number, required: true },
  totalCommissionEarned: { type: Number, required: true }, // AgriPulse 15% revenue
  totalAmount: { type: Number, required: true }, // Total paid by buyer
  totalSavings: { type: Number, required: true }, // Total money saved by community
  paymentMethod: { type: String, default: 'UPI (Demo)' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'cod'], default: 'paid' },
  deliveryStatus: { type: String, enum: ['confirmed', 'processing', 'dispatched', 'delivered'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
