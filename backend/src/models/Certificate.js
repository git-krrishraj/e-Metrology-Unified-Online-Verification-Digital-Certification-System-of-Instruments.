import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true
    },
    verificationRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationRecord',
      required: true,
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instrument',
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    stampNumber: {
      type: String,
      required: true,
      trim: true
    },
    qrToken: {
      type: String,
      required: true
    },
    qrCodeDataUrl: {
      type: String
    },
    pdfPath: {
      type: String
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now
    },
    validTill: {
      type: Date,
      required: true,
      index: true // Indexed for daily cron queries
    },
    status: {
      type: String,
      enum: ['valid', 'expired', 'suspended', 'revoked'],
      default: 'valid',
      index: true
    },
    renewalAlertsSent: {
      day30: { type: Boolean, default: false },
      day15: { type: Boolean, default: false },
      day7: { type: Boolean, default: false }
    },
    revocationReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying active certificates expiring in a date window
certificateSchema.index({ status: 1, validTill: 1 });

export const Certificate = mongoose.model('Certificate', certificateSchema);
