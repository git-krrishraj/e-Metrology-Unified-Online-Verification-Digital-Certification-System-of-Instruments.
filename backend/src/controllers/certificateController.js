import { Certificate } from '../models/Certificate.js';
import path from 'path';
import fs from 'fs';

/**
 * @desc    Get certificates owned by logged-in consumer
 * @route   GET /api/certificates/my
 * @access  Private (Consumer)
 */
export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ owner: req.user._id })
      .populate('instrument')
      .populate('issuedBy', 'name officerId designation jurisdictionDistrict')
      .populate('verificationRecord')
      .sort({ validTill: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all certificates (Admin / Search)
 * @route   GET /api/certificates
 * @access  Private (Admin, LMO, GATC)
 */
export const getAllCertificates = async (req, res, next) => {
  try {
    const { status, search, expiringInDays } = req.query;
    const query = {};

    if (status) query.status = status;

    if (expiringInDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + parseInt(expiringInDays));
      query.validTill = { $lte: targetDate, $gte: new Date() };
      query.status = 'valid';
    }

    if (search) {
      query.$or = [
        { certId: { $regex: search, $options: 'i' } },
        { stampNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const certificates = await Certificate.find(query)
      .populate('owner', 'name email organizationName phone')
      .populate('instrument')
      .populate('issuedBy', 'name officerId designation jurisdictionDistrict')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get certificate by ID
 * @route   GET /api/certificates/:id
 * @access  Private
 */
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('owner', 'name email organizationName phone tradeLicenseNo')
      .populate('instrument')
      .populate('issuedBy', 'name officerId designation jurisdictionDistrict jurisdictionState phone')
      .populate('verificationRecord');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download / view generated certificate PDF
 * @route   GET /api/certificates/:id/pdf
 * @access  Public (or Private)
 */
export const downloadCertificatePDF = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate || !certificate.pdfPath) {
      return res.status(404).json({ success: false, message: 'Certificate PDF not found' });
    }

    const absolutePath = path.resolve(certificate.pdfPath.replace(/^\//, ''));
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not available on disk' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${certificate.certId}.pdf"`);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (error) {
    next(error);
  }
};
