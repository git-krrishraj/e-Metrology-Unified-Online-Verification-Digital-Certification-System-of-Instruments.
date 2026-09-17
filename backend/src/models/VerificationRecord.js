import mongoose from 'mongoose';

const verificationRecordSchema = new mongoose.Schema(
  {
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
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    verificationDate: {
      type: Date,
      default: Date.now
    },
    visualChecklist: {
      sealIntact: { type: Boolean, default: true },
      levelIndicatorAligned: { type: Boolean, default: true },
      noPhysicalDamage: { type: Boolean, default: true },
      markingPlateLegible: { type: Boolean, default: true },
      stampingPlugsAccessible: { type: Boolean, default: true }
    },
    testReadings: [
      {
        testIndex: { type: Number },
        testLoadKg: { type: Number, required: true },
        observedReadingKg: { type: Number, required: true },
        errorKg: { type: Number },
        maxAllowedErrorKg: { type: Number },
        tolerance: { type: String },
        passed: { type: Boolean, required: true }
      }
    ],
    eccentricityTest: {
      performed: { type: Boolean, default: true },
      testLoadKg: { type: Number, default: 10 },
      passed: { type: Boolean, default: true },
      notes: { type: String, default: 'Corner load test within 1e tolerance' }
    },
    repeatabilityTest: {
      performed: { type: Boolean, default: true },
      testLoadKg: { type: Number, default: 20 },
      passed: { type: Boolean, default: true },
      notes: { type: String, default: '3 consecutive readings consistent' }
    },
    overallResult: {
      type: String,
      enum: ['pass', 'fail'],
      required: true
    },
    stampNumberAssigned: {
      type: String,
      trim: true
    },
    inspectorNotes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    inspectionPhotos: [
      {
        type: String
      }
    ],
    geoCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    offlineSynced: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const VerificationRecord = mongoose.model('VerificationRecord', verificationRecordSchema);
