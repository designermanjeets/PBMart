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
    salt: {
        type: String,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            'Please provide a valid phone number'
        ]
    },
    address:[
        { type: Schema.Types.ObjectId, ref: 'address', require: true }
    ],
    cart: [
        {
          product: { 
                _id: { type: String, require: true},
                name: { type: String},
                banner: { type: String},
                price: { type: Number},
            },
          unit: { type: Number, require: true}
        }
    ],
    wishlist:[
        {
            _id: { type: String, require: true },
            name: { type: String },
            description: { type: String },
            banner: { type: String },
            avalable: { type: Boolean },
            price: { type: Number },
        }
    ],
    orders: [
        {
            _id: {type: String, required: true},
            amount: { type: String},
            date: {type: Date, default: Date.now()}
        }
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
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
});

// Indexes for better query performance
CustomerSchema.index({ email: 1 }, { unique: true });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    this.salt = salt;
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

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
