import { Application } from '../models/Application.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc    Get all available LMOs and GATCs with pending workload counts
 * @route   GET /api/allocation/officers
 * @access  Private (Admin)
 */
export const getOfficersList = async (req, res, next) => {
  try {
    const officers = await User.find({ role: { $in: ['lmo', 'gatc'] }, isActive: true })
      .select('name email role officerId designation jurisdictionDistrict jurisdictionState phone');

    // Aggregate pending workload for each officer
    const officerIds = officers.map(o => o._id);
    const workloads = await Application.aggregate([
      { $match: { assignedTo: { $in: officerIds }, status: 'scheduled' } },
      { $group: { _id: '$assignedTo', pendingCount: { $sum: 1 } } }
    ]);

    const workloadMap = {};
    workloads.forEach(w => {
      workloadMap[w._id.toString()] = w.pendingCount;
    });

    const officersWithWorkload = officers.map(officer => ({
      ...officer.toObject(),
      pendingInspections: workloadMap[officer._id.toString()] || 0
    }));

    res.json({ success: true, officers: officersWithWorkload });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign application to an officer (LMO/GATC) and schedule inspection
 * @route   POST /api/allocation/assign
 * @access  Private (Admin)
 */
export const assignApplication = async (req, res, next) => {
  try {
    const { applicationId, officerId, scheduledDate, remarks } = req.body;

    const application = await Application.findById(applicationId).populate('applicant instrument');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const officer = await User.findById(officerId);
    if (!officer || !['lmo', 'gatc'].includes(officer.role)) {
      return res.status(400).json({ success: false, message: 'Invalid officer selected for assignment' });
    }

    application.assignedTo = officer._id;
    application.assignedBy = req.user._id;
    application.assignedAt = new Date();
    application.scheduledDate = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    application.status = 'scheduled';
    if (remarks) application.remarks = remarks;

    await application.save();

    // 1. Notify the Applicant
    await Notification.create({
      recipient: application.applicant._id,
      title: 'Verification Officer Assigned',
      message: `Your application (${application.applicationNo}) for ${application.instrument?.instrumentName} has been assigned to ${officer.name} (${officer.designation || 'LMO'}). Inspection scheduled for ${new Date(application.scheduledDate).toLocaleDateString('en-IN')}.`,
      type: 'allocation',
      link: `/consumer/applications`
    });

    // 2. Notify the Officer
    await Notification.create({
      recipient: officer._id,
      title: 'New Verification Task Assigned',
      message: `You have been assigned to verify ${application.instrument?.instrumentName} for ${application.applicant?.name} in ${application.district}.`,
      type: 'allocation',
      link: `/officer/queue`
    });

    res.json({
      success: true,
      message: `Application assigned to ${officer.name} successfully`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Auto-assign an application based on district and workload
 * @route   POST /api/allocation/auto-assign/:id
 * @access  Private (Admin)
 */
export const autoAssignApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('applicant instrument');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Find officers in matching district or any active officer
    let officers = await User.find({
      role: { $in: ['lmo', 'gatc'] },
      isActive: true,
      jurisdictionDistrict: application.district
    });

    if (officers.length === 0) {
      // Fallback to any active officer in state
      officers = await User.find({ role: { $in: ['lmo', 'gatc'] }, isActive: true });
    }

    if (officers.length === 0) {
      return res.status(400).json({ success: false, message: 'No active verification officers found in the system' });
    }

    // Count pending workloads
    const officerIds = officers.map(o => o._id);
    const workloads = await Application.aggregate([
      { $match: { assignedTo: { $in: officerIds }, status: 'scheduled' } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]);

    const workloadMap = {};
    workloads.forEach(w => { workloadMap[w._id.toString()] = w.count; });

    // Select officer with lowest count
    officers.sort((a, b) => (workloadMap[a._id.toString()] || 0) - (workloadMap[b._id.toString()] || 0));
    const selectedOfficer = officers[0];

    application.assignedTo = selectedOfficer._id;
    application.assignedBy = req.user._id;
    application.assignedAt = new Date();
    application.scheduledDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    application.status = 'scheduled';
    await application.save();

    // Send notifications
    await Notification.create({
      recipient: application.applicant._id,
      title: 'Verification Officer Auto-Assigned',
      message: `Officer ${selectedOfficer.name} has been assigned to verify ${application.instrument?.instrumentName}. Scheduled for ${new Date(application.scheduledDate).toLocaleDateString('en-IN')}.`,
      type: 'allocation',
      link: `/consumer/applications`
    });

    await Notification.create({
      recipient: selectedOfficer._id,
      title: 'New Verification Task Auto-Assigned',
      message: `You have been auto-assigned to verify application ${application.applicationNo} in ${application.district}.`,
      type: 'allocation',
      link: `/officer/queue`
    });

    res.json({
      success: true,
      message: `Auto-assigned application to ${selectedOfficer.name}`,
      application,
      assignedOfficer: selectedOfficer
    });
  } catch (error) {
    next(error);
  }
};
