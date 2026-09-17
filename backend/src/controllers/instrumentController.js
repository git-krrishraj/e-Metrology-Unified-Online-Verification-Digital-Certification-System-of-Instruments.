import { Instrument } from '../models/Instrument.js';
import { Certificate } from '../models/Certificate.js';
import { Application } from '../models/Application.js';

/**
 * @desc    Register a new measuring instrument
 * @route   POST /api/instruments
 * @access  Private (Consumer, Admin)
 */
export const createInstrument = async (req, res, next) => {
  try {
    const {
      instrumentName,
      category,
      accuracyClass,
      model,
      serialNumber,
      manufacturer,
      yearOfManufacture,
      maxCapacity,
      minCapacity,
      verificationScaleInterval,
      units = 'kg',
      establishmentName,
      address,
      district,
      state = 'Maharashtra',
      pincode = '400001'
    } = req.body;

    const existing = await Instrument.findOne({ serialNumber: serialNumber.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An instrument with serial number '${serialNumber}' is already registered in the system.`
      });
    }

    // Process uploaded photos if any
    const photos = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        photos.push(`/uploads/${file.filename}`);
      });
    }

    const instrument = await Instrument.create({
      owner: req.user._id,
      instrumentName,
      category,
      accuracyClass,
      model,
      serialNumber: serialNumber.trim(),
      manufacturer,
      yearOfManufacture: yearOfManufacture || new Date().getFullYear(),
      maxCapacity: parseFloat(maxCapacity),
      minCapacity: parseFloat(minCapacity || 0),
      verificationScaleInterval: parseFloat(verificationScaleInterval || 0.001),
      units,
      location: {
        establishmentName,
        address,
        district,
        state,
        pincode
      },
      photos,
      status: 'due_verification'
    });

    res.status(201).json({
      success: true,
      message: 'Instrument registered successfully',
      instrument
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all instruments owned by logged-in user
 * @route   GET /api/instruments/my
 * @access  Private (Consumer)
 */
export const getMyInstruments = async (req, res, next) => {
  try {
    const instruments = await Instrument.find({ owner: req.user._id })
      .populate('currentCertificate')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: instruments.length, instruments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get instrument details with history
 * @route   GET /api/instruments/:id
 * @access  Private
 */
export const getInstrumentById = async (req, res, next) => {
  try {
    const instrument = await Instrument.findById(req.params.id)
      .populate('owner', 'name email phone organizationName')
      .populate('currentCertificate');

    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found' });
    }

    // Check ownership unless admin/officer
    if (req.user.role === 'consumer' && instrument.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this instrument' });
    }

    // Fetch previous applications & certificates
    const applications = await Application.find({ instrument: instrument._id })
      .populate('assignedTo', 'name officerId')
      .populate('certificate')
      .sort({ createdAt: -1 });

    const certificates = await Certificate.find({ instrument: instrument._id })
      .populate('issuedBy', 'name officerId designation')
      .sort({ validTill: -1 });

    res.json({
      success: true,
      instrument,
      applications,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all instruments (Admin / LMO)
 * @route   GET /api/instruments
 * @access  Private (Admin, LMO, GATC)
 */
export const getAllInstruments = async (req, res, next) => {
  try {
    const { district, category, status, search } = req.query;
    const query = {};

    if (district) query['location.district'] = district;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { instrumentName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const instruments = await Instrument.find(query)
      .populate('owner', 'name email organizationName phone')
      .populate('currentCertificate')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: instruments.length, instruments });
  } catch (error) {
    next(error);
  }
};
