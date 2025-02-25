const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    desc: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [1000, 'Product description cannot exceed 1000 characters']
    },
    banner: {
      type: String,
      required: [true, 'Product banner image is required']
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      enum: {
        values: ['electronics', 'clothing', 'furniture', 'books', 'other'],
        message: 'Product type must be one of: electronics, clothing, furniture, books, other'
      }
    },
    unit: {
      type: Number,
      required: [true, 'Product unit is required'],
      min: [0, 'Product unit cannot be negative']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price cannot be negative']
    },
    available: {
      type: Boolean,
      default: true
    },
    supplier: {
      type: String,
      required: [true, 'Product supplier is required']
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