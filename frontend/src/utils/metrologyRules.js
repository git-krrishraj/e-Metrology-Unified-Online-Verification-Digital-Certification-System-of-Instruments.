/**
 * Client-side Legal Metrology MPE (Maximum Permissible Error) validator
 * Compliant with Legal Metrology (General) Rules, 2011 (Schedule VII).
 */

export const calculateMPE = (loadKg, verificationIntervalE = 0.001, accuracyClass = 'Class III', isReverification = true) => {
  const e = parseFloat(verificationIntervalE) || 0.001;
  const load = parseFloat(loadKg) || 0;
  
  if (e <= 0 || load <= 0) return { mpeInE: 1, mpeInKg: e, toleranceText: `±${e} kg` };

  const n = load / e; // Number of verification scale intervals (m / e)
  let mpeE = 1.0;

  if (accuracyClass.includes('Class I')) {
    if (n <= 50000) mpeE = 0.5;
    else if (n <= 200000) mpeE = 1.0;
    else mpeE = 1.5;
  } else if (accuracyClass.includes('Class II')) {
    if (n <= 5000) mpeE = 0.5;
    else if (n <= 20000) mpeE = 1.0;
    else mpeE = 1.5;
  } else if (accuracyClass.includes('Class IIII')) {
    if (n <= 50) mpeE = 0.5;
    else if (n <= 200) mpeE = 1.0;
    else if (n <= 1000) mpeE = 1.5;
  } else {
    // Class III (Commercial Trade)
    if (n <= 500) mpeE = 0.5;
    else if (n <= 2000) mpeE = 1.0;
    else mpeE = 1.5;
  }

  if (isReverification) {
    mpeE = mpeE * 2;
  }

  const mpeKg = parseFloat((mpeE * e).toFixed(6));
  return {
    intervals: n,
    mpeInE: mpeE,
    mpeInKg: mpeKg,
    toleranceText: `±${mpeKg} kg (±${mpeE}e)`
  };
};

export const checkReadingCompliance = (loadKg, observedKg, verificationIntervalE = 0.001, accuracyClass = 'Class III', isReverification = true) => {
  const load = parseFloat(loadKg);
  const observed = parseFloat(observedKg);

  if (isNaN(load) || isNaN(observed)) {
    return { isValid: false, errorKg: 0, maxAllowedErrorKg: 0, passed: false, toleranceText: '-' };
  }

  const errorKg = parseFloat((observed - load).toFixed(6));
  const { mpeInKg, toleranceText } = calculateMPE(load, verificationIntervalE, accuracyClass, isReverification);
  const passed = Math.abs(errorKg) <= mpeInKg + 1e-9;

  return {
    isValid: true,
    errorKg,
    maxAllowedErrorKg: mpeInKg,
    toleranceText,
    passed
  };
};
