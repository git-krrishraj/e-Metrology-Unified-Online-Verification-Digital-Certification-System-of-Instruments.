/**
 * Legal Metrology (General) Rules, 2011 & OIML R 76 Compliance Calculator
 * Maximum Permissible Error (MPE) calculations for Weighing Instruments.
 */

export const calculateMPE = (loadKg, verificationIntervalE, accuracyClass = 'Class III', isReverification = true) => {
  const e = parseFloat(verificationIntervalE) || 0.001; // verification scale interval in kg
  const load = parseFloat(loadKg) || 0;
  
  if (e <= 0 || load <= 0) return { mpeInE: 1, mpeInKg: e, toleranceString: `±${e} kg` };

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
    // Class III (Default Commercial Trade NAWI)
    if (n <= 500) mpeE = 0.5;
    else if (n <= 2000) mpeE = 1.0;
    else mpeE = 1.5;
  }

  // Under Legal Metrology rules, in-service/re-verification tolerance is 2x of initial verification MPE
  if (isReverification) {
    mpeE = mpeE * 2;
  }

  const mpeKg = parseFloat((mpeE * e).toFixed(6));
  return {
    intervals: n,
    mpeInE: mpeE,
    mpeInKg: mpeKg,
    toleranceString: `±${mpeKg} kg (±${mpeE}e)`
  };
};

/**
 * Validates a list of test load observations
 * @param {Array<{ testLoadKg: number, observedReadingKg: number }>} testReadings
 * @param {number} verificationIntervalE
 * @param {string} accuracyClass
 * @param {boolean} isReverification
 */
export const evaluateInspectionReadings = (testReadings = [], verificationIntervalE = 0.001, accuracyClass = 'Class III', isReverification = true) => {
  if (!Array.isArray(testReadings) || testReadings.length === 0) {
    return { isCompliant: false, results: [], summary: 'No test readings provided' };
  }

  let allPassed = true;
  const results = testReadings.map((reading, index) => {
    const load = parseFloat(reading.testLoadKg);
    const observed = parseFloat(reading.observedReadingKg);
    const error = parseFloat((observed - load).toFixed(6));
    const absError = Math.abs(error);
    const { mpeInKg, toleranceString } = calculateMPE(load, verificationIntervalE, accuracyClass, isReverification);
    
    const passed = absError <= mpeInKg + 1e-9;
    if (!passed) allPassed = false;

    return {
      testIndex: index + 1,
      testLoadKg: load,
      observedReadingKg: observed,
      errorKg: error,
      maxAllowedErrorKg: mpeInKg,
      tolerance: toleranceString,
      passed
    };
  });

  return {
    isCompliant: allPassed,
    results,
    summary: allPassed 
      ? 'All test load readings are within Maximum Permissible Error (MPE) tolerances.' 
      : 'One or more test load readings exceed Maximum Permissible Error (MPE) limits under Legal Metrology Rules.'
  };
};
