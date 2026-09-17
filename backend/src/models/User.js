import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['consumer', 'lmo', 'gatc', 'admin'],
      default: 'consumer'
    },
    phone: {
      type: String,
      default: ''
    },
    organizationName: {
      type: String,
      default: ''
    },
    tradeLicenseNo: {
      type: String,
      default: ''
    },
    gstin: {
      type: String,
      default: ''
    },
    // For LMO / GATC officers
    officerId: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: ''
    },
    jurisdictionState: {
      type: String,
      default: 'Maharashtra'
    },
    jurisdictionDistrict: {
      type: String,
      default: 'Mumbai City'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
