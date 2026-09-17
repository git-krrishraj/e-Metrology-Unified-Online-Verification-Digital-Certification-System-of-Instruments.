import { Application } from '../models/Application.js';
import { Instrument } from '../models/Instrument.js';
import { Notification } from '../models/Notification.js';
import { FEE_STRUCTURE } from '../config/constants.js';

/**
 * @desc    Submit an application for verification/stamping
 * @route   POST /api/applications
 * @access  Private (Consumer)
 */
export const submitApplication = async (req, res, next) => {
  try {
    const {
      instrumentId,
      applicationType = 'periodic_reverification',
      inspectionType = 'on_site',
      remarks
    } = req.body;

    const instrument = await Instrument.findById(instrumentId);
    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found' });
    }

    if (instrument.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only apply for your own instruments' });
    }

    // Check if there is already an active pending application
    const pendingApp = await Application.findOne({
      instrument: instrumentId,
      status: { $in: ['submitted', 'scheduled'] }
    });

    if (pendingApp) {
      return res.status(400).json({
        success: false,
        message: `An application (${pendingApp.applicationNo}) is already pending for this instrument.`
      });
    }

    const stampingFee = FEE_STRUCTURE[instrument.category] || 350;

    const application = await Application.create({
      instrument: instrument._id,
      applicant: req.user._id,
      applicationType,
      inspectionType,
      district: instrument.location.district,
      state: instrument.location.state,
      stampingFee,
      paymentStatus: 'paid',
      remarks: remarks || ''
    });

    // Update instrument status to in_process
    instrument.status = 'in_process';
    await instrument.save();

    // Create user notification
    await Notification.create({
      recipient: req.user._id,
      title: 'Verification Application Submitted',
      message: `Your application (${application.applicationNo}) for ${instrument.instrumentName} has been submitted successfully and is awaiting inspector allocation.`,
      type: 'application_status',
      link: `/consumer/applications`
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user's applications
 * @route   GET /api/applications/my
 * @access  Private (Consumer)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('instrument')
      .populate('assignedTo', 'name officerId designation jurisdictionDistrict phone')
      .populate('certificate')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications (Admin / Officer filterable)
 * @route   GET /api/applications
 * @access  Private (Admin, LMO, GATC)
 */
export const getAllApplications = async (req, res, next) => {
  try {
    const { status, district, applicationType, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (district) query.district = district;
    if (applicationType) query.applicationType = applicationType;
    if (search) {
      query.applicationNo = { $regex: search, $options: 'i' };
    }

    const applications = await Application.find(query)
      .populate('applicant', 'name email organizationName phone')
      .populate('instrument')
      .populate('assignedTo', 'name officerId designation jurisdictionDistrict')
      .populate('certificate')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email organizationName phone tradeLicenseNo')
      .populate('instrument')
      .populate('assignedTo', 'name officerId designation jurisdictionDistrict phone')
      .populate('verificationRecord')
      .populate('certificate');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Authorization check
    if (req.user.role === 'consumer' && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application' });
    }

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};
