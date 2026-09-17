import mongoose from 'mongoose';

const instrumentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    instrumentName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    accuracyClass: {
      type: String,
      default: 'Class III (Medium Accuracy - Commercial Trade)'
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true
    },
    yearOfManufacture: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    maxCapacity: {
      type: Number,
      required: true
    },
    minCapacity: {
      type: Number,
      default: 0
    },
    verificationScaleInterval: {
      type: Number,
      required: true, // the 'e' value
      default: 0.001
    },
    units: {
      type: String,
      default: 'kg',
      enum: ['kg', 'g', 'mg', 'tonnes', 'litres', 'metres']
    },
    location: {
      establishmentName: { type: String, default: '' },
      address: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, default: 'Maharashtra' },
      pincode: { type: String, default: '400001' }
    },
    photos: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['active', 'due_verification', 'in_process', 'decommissioned'],
      default: 'due_verification'
    },
    lastVerifiedAt: {
      type: Date
    },
    currentCertificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    }
  },
  {
    timestamps: true
  }
);

export const Instrument = mongoose.model('Instrument', instrumentSchema);
