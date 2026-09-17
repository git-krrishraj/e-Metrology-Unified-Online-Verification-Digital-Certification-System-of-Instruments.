import mongoose from 'mongoose';

const jurisdictionSchema = new mongoose.Schema(
  {
    districtName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      default: 'Maharashtra'
    },
    zoneCode: {
      type: String,
      default: 'WZ-01'
    },
    headquarters: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Jurisdiction = mongoose.model('Jurisdiction', jurisdictionSchema);
