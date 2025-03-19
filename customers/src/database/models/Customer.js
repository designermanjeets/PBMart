const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { AuthenticationError } = require('../../utils/errors');

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in query results by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            'Please provide a valid phone number'
        ]
    },
    address: [
        { type: Schema.Types.ObjectId, ref: 'address', require: true }
    ],
    cart: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'product', require: true },
            unit: { type: Number, require: true }
        }
    ],
    wishlist: [
        { 
            type: Schema.Types.ObjectId, ref: 'product', require: true
        }
    ],
    orders: [
        { type: Schema.Types.ObjectId, ref: 'order', require: true }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.__v;
        }
    },
    timestamps: true
});

// Indexes for better query performance
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ isActive: 1 });

// IMPORTANT: Comment out or remove this pre-save middleware
// since we're already hashing the password in the service layer
/*
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});
*/

// Method to compare passwords
CustomerSchema.methods.comparePassword = async function(password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    if (!isMatch) throw new AuthenticationError('Invalid email or password');
    return true;
  } catch (error) {
    throw error;
  }
};

// Method to update last login
CustomerSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Static method to find by email
CustomerSchema.statics.findByEmail = function(email) {
  return this.findOne({ email, isActive: true });
};

module.exports =  mongoose.model('customer', CustomerSchema);
