import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicationNo: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instrument',
      required: true,
      index: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    applicationType: {
      type: String,
      enum: ['initial_verification', 'periodic_reverification', 're_verification_after_repair', 'stamping'],
      default: 'periodic_reverification'
    },
    status: {
      type: String,
      enum: ['submitted', 'scheduled', 'verified', 'rejected', 'certified'],
      default: 'submitted',
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date
    },
    scheduledDate: {
      type: Date
    },
    inspectionType: {
      type: String,
      enum: ['on_site', 'test_centre'],
      default: 'on_site'
    },
    district: {
      type: String,
      required: true,
      index: true
    },
    state: {
      type: String,
      default: 'Maharashtra'
    },
    stampingFee: {
      type: Number,
      default: 350
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'exempted'],
      default: 'paid'
    },
    paymentReference: {
      type: String,
      default: () => 'TXN-' + Math.floor(100000 + Math.random() * 900000)
    },
    attachments: [
      {
        type: String
      }
    ],
    remarks: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    verificationRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationRecord'
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save to generate sequential / unique application number if not present
applicationSchema.pre('validate', function (next) {
  if (!this.applicationNo) {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.applicationNo = `APP-${year}-${random}`;
  }
  next();
});

export const Application = mongoose.model('Application', applicationSchema);
