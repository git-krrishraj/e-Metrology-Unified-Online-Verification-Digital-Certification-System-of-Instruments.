export const ROLES = {
  CONSUMER: 'consumer',
  LMO: 'lmo',
  GATC: 'gatc',
  ADMIN: 'admin'
};

export const INSTRUMENT_CATEGORIES = {
  NON_AUTOMATIC_WEIGHING: 'Non-Automatic Weighing Instrument (NAWI)',
  AUTOMATIC_WEIGHING: 'Automatic Weighing Instrument (AWI)',
  WEIGHBRIDGE: 'Electronic Weighbridge',
  FUEL_DISPENSER: 'Fuel Dispenser / Petrol Pump Flowmeter',
  LIQUID_CAPACITY_MEASURE: 'Liquid Capacity Measure',
  LENGTH_MEASURE: 'Length & Dimensional Measure',
  COUNTER_SCALE: 'Counter / Platform Scale'
};

export const ACCURACY_CLASSES = {
  CLASS_I: 'Class I (Special Accuracy)',
  CLASS_II: 'Class II (High Accuracy)',
  CLASS_III: 'Class III (Medium Accuracy - Commercial Trade)',
  CLASS_IIII: 'Class IIII (Ordinary Accuracy - Heavy Industrial)'
};

export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  SCHEDULED: 'scheduled',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  CERTIFIED: 'certified'
};

export const CERTIFICATE_STATUS = {
  VALID: 'valid',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked'
};

export const FEE_STRUCTURE = {
  'Counter / Platform Scale': 200,
  'Non-Automatic Weighing Instrument (NAWI)': 350,
  'Automatic Weighing Instrument (AWI)': 600,
  'Electronic Weighbridge': 1500,
  'Fuel Dispenser / Petrol Pump Flowmeter': 1000,
  'Liquid Capacity Measure': 150,
  'Length & Dimensional Measure': 100
};
