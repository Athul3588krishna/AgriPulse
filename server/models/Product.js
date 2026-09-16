const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameMl: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['bio-fungicides', 'seeds', 'fertilizers', 'equipment', 'irrigation'],
    required: true 
  },
  description: { type: String, default: '' },
  descriptionMl: { type: String, default: '' },
  unit: { type: String, default: '50kg Bag' },
  outsidePrice: { type: Number, required: true }, // Local retail price
  factoryPrice: { type: Number, required: true }, // Direct manufacturer price
  commissionRate: { type: Number, default: 0.15 }, // 15% AgriPulse commission
  minOrderQuantity: { type: Number, default: 2 },
  inStock: { type: Number, default: 500 },
  manufacturer: { type: String, default: 'Certified Agri-Manufacturer' },
  image: { type: String, default: '' },
  isPopular: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 120 },
  createdAt: { type: Date, default: Date.now }
});

// Virtual calculation helper for final buyer price: factoryPrice + 15%
productSchema.virtual('commissionAmount').get(function() {
  return Math.round(this.factoryPrice * this.commissionRate);
});

productSchema.virtual('finalPrice').get(function() {
  return Math.round(this.factoryPrice * (1 + this.commissionRate));
});

productSchema.virtual('savingsPerUnit').get(function() {
  const finalPrice = Math.round(this.factoryPrice * (1 + this.commissionRate));
  return Math.max(0, this.outsidePrice - finalPrice);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
