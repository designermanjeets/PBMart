const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    desc: {
      type: String,
      default: 'No description provided'
    },
    banner: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    type: {
      type: String,
      default: 'other'
    },
    unit: {
      type: Number,
      default: 1
    },
    price: {
      type: Number,
      default: 0
    },
    available: {
      type: Boolean,
      default: true
    },
    supplier: {
      type: String,
      default: 'Unknown Supplier'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      }
    },
    timestamps: true
  }
);

// Indexes for better query performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ type: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ available: 1 });

// Pre-save middleware to update timestamps
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for product URL
ProductSchema.virtual('url').get(function() {
  return `/products/${this._id}`;
});

// Static method to find products by type
ProductSchema.statics.findByType = function(type) {
  return this.find({ type, available: true });
};

// Static method to find products by price range
ProductSchema.statics.findByPriceRange = function(min, max) {
  return this.find({ 
    price: { $gte: min, $lte: max },
    available: true 
  });
};

module.exports = mongoose.model('product', ProductSchema);