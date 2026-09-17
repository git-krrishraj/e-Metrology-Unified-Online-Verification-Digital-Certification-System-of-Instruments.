import { Certificate } from '../models/Certificate.js';
import { Instrument } from '../models/Instrument.js';
import { verifyCertificateToken } from '../utils/crypto.js';

/**
 * @desc    Public verification endpoint (QR code scan / URL lookup)
 * @route   GET /api/public/verify/:certId
 * @access  Public (No Login Required)
 */
export const verifyCertificatePublic = async (req, res, next) => {
  try {
    const { certId } = req.params;
    const { token } = req.query;

    const certificate = await Certificate.findOne({ certId: certId.trim() })
      .populate('owner', 'name organizationName')
      .populate('instrument')
      .populate('issuedBy', 'name officerId designation jurisdictionDistrict jurisdictionState')
      .populate('verificationRecord');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        isAuthentic: false,
        message: 'No certificate found with the provided Certificate ID. This document may be fraudulent or unrecorded in the National Legal Metrology database.'
      });
    }

    // Cryptographic signature check
    let isSignatureValid = true;
    if (token) {
      isSignatureValid = verifyCertificateToken(token, certificate.certId, certificate.validTill, certificate.stampNumber);
    }

    const now = new Date();
    const validTill = new Date(certificate.validTill);
    const isExpired = now > validTill;
    const diffDays = Math.ceil((validTill - now) / (1000 * 60 * 60 * 24));

    let effectiveStatus = certificate.status;
    if (isExpired && effectiveStatus === 'valid') {
      effectiveStatus = 'expired';
    }

    res.json({
      success: true,
      isAuthentic: true,
      isSignatureValid,
      effectiveStatus,
      daysRemaining: isExpired ? 0 : diffDays,
      certificate: {
        id: certificate._id,
        certId: certificate.certId,
        stampNumber: certificate.stampNumber,
        validFrom: certificate.validFrom,
        validTill: certificate.validTill,
        status: effectiveStatus,
        issueDate: certificate.createdAt,
        pdfUrl: certificate.pdfPath ? `/api/certificates/${certificate._id}/pdf` : null
      },
      instrument: {
        instrumentName: certificate.instrument?.instrumentName,
        category: certificate.instrument?.category,
        model: certificate.instrument?.model,
        serialNumber: certificate.instrument?.serialNumber,
        accuracyClass: certificate.instrument?.accuracyClass,
        maxCapacity: certificate.instrument?.maxCapacity,
        verificationScaleInterval: certificate.instrument?.verificationScaleInterval,
        units: certificate.instrument?.units,
        location: certificate.instrument?.location
      },
      owner: {
        name: certificate.owner?.name,
        organizationName: certificate.owner?.organizationName
      },
      verifyingAuthority: {
        name: certificate.issuedBy?.name,
        officerId: certificate.issuedBy?.officerId,
        designation: certificate.issuedBy?.designation,
        jurisdiction: `${certificate.issuedBy?.jurisdictionDistrict || 'District'}, ${certificate.issuedBy?.jurisdictionState || 'State'}`
      },
      verificationDetails: {
        verificationDate: certificate.verificationRecord?.verificationDate,
        visualChecklist: certificate.verificationRecord?.visualChecklist,
        testReadingsCount: certificate.verificationRecord?.testReadings?.length || 0,
        inspectorNotes: certificate.verificationRecord?.inspectorNotes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search public registry by Serial Number or Certificate ID
 * @route   GET /api/public/search
 * @access  Public
 */
export const searchPublicRegistry = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please enter at least 3 characters to search' });
    }

    const certs = await Certificate.find({
      $or: [
        { certId: { $regex: query, $options: 'i' } },
        { stampNumber: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('instrument', 'instrumentName serialNumber category model')
      .limit(10);

    const instruments = await Instrument.find({
      serialNumber: { $regex: query, $options: 'i' }
    })
      .populate('currentCertificate')
      .limit(10);

    res.json({ success: true, certificates: certs, instruments });
  } catch (error) {
    next(error);
  }
};
