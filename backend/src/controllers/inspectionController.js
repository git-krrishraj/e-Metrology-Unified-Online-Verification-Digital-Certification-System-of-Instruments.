import { Application } from '../models/Application.js';
import { Instrument } from '../models/Instrument.js';
import { VerificationRecord } from '../models/VerificationRecord.js';
import { Certificate } from '../models/Certificate.js';
import { Notification } from '../models/Notification.js';
import { evaluateInspectionReadings } from '../utils/metrologyRules.js';
import { generateVerificationQRCode } from '../services/qrService.js';
import { generateCertificatePDF } from '../services/pdfService.js';

/**
 * @desc    Get applications assigned to logged-in LMO/GATC officer
 * @route   GET /api/inspections/queue
 * @access  Private (LMO, GATC)
 */
export const getAssignedQueue = async (req, res, next) => {
  try {
    const applications = await Application.find({
      assignedTo: req.user._id,
      status: { $in: ['scheduled', 'verified', 'rejected', 'certified'] }
    })
      .populate('applicant', 'name email phone organizationName')
      .populate('instrument')
      .populate('verificationRecord')
      .populate('certificate')
      .sort({ scheduledDate: 1, createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record digital inspection results & issue digital certificate
 * @route   POST /api/inspections/record
 * @access  Private (LMO, GATC)
 */
export const recordInspection = async (req, res, next) => {
  try {
    const {
      applicationId,
      visualChecklist,
      testReadings,
      eccentricityTest,
      repeatabilityTest,
      overallResult,
      stampNumberAssigned,
      inspectorNotes,
      rejectionReason,
      geoCoordinates
    } = req.body;

    const application = await Application.findById(applicationId)
      .populate('applicant')
      .populate('instrument');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify officer assignment
    if (application.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not the assigned officer for this application' });
    }

    const instrument = application.instrument;
    const isReverification = application.applicationType !== 'initial_verification';

    // Parse readings if JSON string
    let parsedReadings = typeof testReadings === 'string' ? JSON.parse(testReadings) : (testReadings || []);
    let parsedVisual = typeof visualChecklist === 'string' ? JSON.parse(visualChecklist) : (visualChecklist || {});
    let parsedEccentricity = typeof eccentricityTest === 'string' ? JSON.parse(eccentricityTest) : (eccentricityTest || {});
    let parsedRepeatability = typeof repeatabilityTest === 'string' ? JSON.parse(repeatabilityTest) : (repeatabilityTest || {});
    let parsedGeo = typeof geoCoordinates === 'string' ? JSON.parse(geoCoordinates) : geoCoordinates;

    // Handle uploaded inspection photos
    const inspectionPhotos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        inspectionPhotos.push(`/uploads/${file.filename}`);
      });
    }

    // Evaluate MPE compliance on test readings
    const evaluation = evaluateInspectionReadings(
      parsedReadings,
      instrument.verificationScaleInterval,
      instrument.accuracyClass,
      isReverification
    );

    const isPassed = overallResult === 'pass' && (evaluation.isCompliant || parsedReadings.length === 0);
    const finalResult = isPassed ? 'pass' : 'fail';

    // 1. Create Verification Record
    const verificationRecord = await VerificationRecord.create({
      application: application._id,
      instrument: instrument._id,
      verifiedBy: req.user._id,
      verificationDate: new Date(),
      visualChecklist: parsedVisual,
      testReadings: evaluation.results.length > 0 ? evaluation.results : parsedReadings,
      eccentricityTest: parsedEccentricity,
      repeatabilityTest: parsedRepeatability,
      overallResult: finalResult,
      stampNumberAssigned: isPassed ? (stampNumberAssigned || `MH/${req.user.officerId || 'LMO'}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`) : '',
      inspectorNotes: inspectorNotes || evaluation.summary,
      rejectionReason: !isPassed ? (rejectionReason || evaluation.summary) : '',
      inspectionPhotos,
      geoCoordinates: parsedGeo
    });

    let certificate = null;

    if (isPassed) {
      // 2. Generate Certificate
      const year = new Date().getFullYear();
      const stateCode = instrument.location?.state?.substring(0, 2).toUpperCase() || 'MH';
      const randomCertSeq = Math.floor(10000 + Math.random() * 90000);
      const certId = `LMA-${stateCode}-${year}-${randomCertSeq}`;

      const validFrom = new Date();
      // Most trade instruments valid for 1 year (12 months), weighbridges / heavy can be 1-2 years
      const validTill = new Date();
      const validityYears = instrument.category.includes('Weighbridge') ? 1 : 1;
      validTill.setFullYear(validTill.getFullYear() + validityYears);

      // Generate Tamper-Proof HMAC & QR Code
      const { qrToken, qrCodeDataUrl, qrBuffer } = await generateVerificationQRCode(
        certId,
        validTill,
        verificationRecord.stampNumberAssigned
      );

      // Generate Official PDF Document
      const pdfPath = await generateCertificatePDF({
        certId,
        validFrom,
        validTill,
        stampNumber: verificationRecord.stampNumberAssigned,
        owner: application.applicant,
        instrument,
        verificationRecord,
        issuedBy: req.user,
        qrBuffer
      });

      certificate = await Certificate.create({
        certId,
        verificationRecord: verificationRecord._id,
        application: application._id,
        instrument: instrument._id,
        owner: application.applicant._id,
        issuedBy: req.user._id,
        stampNumber: verificationRecord.stampNumberAssigned,
        qrToken,
        qrCodeDataUrl,
        pdfPath,
        validFrom,
        validTill,
        status: 'valid'
      });

      // Update Application & Instrument
      application.status = 'certified';
      application.verificationRecord = verificationRecord._id;
      application.certificate = certificate._id;
      await application.save();

      instrument.status = 'active';
      instrument.lastVerifiedAt = new Date();
      instrument.currentCertificate = certificate._id;
      await instrument.save();

      // Notify Owner
      await Notification.create({
        recipient: application.applicant._id,
        title: '🎉 Verification Certificate Issued!',
        message: `Your instrument ${instrument.instrumentName} has successfully passed verification! Certificate ${certId} is now active and valid until ${validTill.toLocaleDateString('en-IN')}.`,
        type: 'inspection_passed',
        link: `/consumer/certificates`
      });

      return res.status(201).json({
        success: true,
        message: 'Inspection completed and Verification Certificate issued successfully.',
        verificationRecord,
        certificate,
        application
      });
    } else {
      // Failed Verification
      application.status = 'rejected';
      application.rejectionReason = rejectionReason || evaluation.summary;
      application.verificationRecord = verificationRecord._id;
      await application.save();

      instrument.status = 'due_verification';
      await instrument.save();

      // Notify Owner
      await Notification.create({
        recipient: application.applicant._id,
        title: '⚠️ Instrument Verification Rejected',
        message: `Verification for ${instrument.instrumentName} did not pass inspection standards. Reason: ${application.rejectionReason}. Please rectify and apply for re-verification.`,
        type: 'inspection_failed',
        link: `/consumer/applications`
      });

      return res.status(200).json({
        success: true,
        message: 'Inspection recorded. Application marked as rejected.',
        verificationRecord,
        application
      });
    }
  } catch (error) {
    next(error);
  }
};
