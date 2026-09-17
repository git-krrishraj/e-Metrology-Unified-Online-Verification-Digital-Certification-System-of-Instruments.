import { Instrument } from '../models/Instrument.js';
import { Application } from '../models/Application.js';
import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';

/**
 * @desc    Get dashboard metrics tailored to current user role
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'consumer') {
      const totalInstruments = await Instrument.countDocuments({ owner: userId });
      const activeInstruments = await Instrument.countDocuments({ owner: userId, status: 'active' });
      const dueVerification = await Instrument.countDocuments({ owner: userId, status: 'due_verification' });
      const pendingApplications = await Application.countDocuments({
        applicant: userId,
        status: { $in: ['submitted', 'scheduled'] }
      });

      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      const expiringSoon = await Certificate.countDocuments({
        owner: userId,
        status: 'valid',
        validTill: { $lte: in30Days, $gte: new Date() }
      });

      const recentApplications = await Application.find({ applicant: userId })
        .populate('instrument')
        .populate('certificate')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentCertificates = await Certificate.find({ owner: userId })
        .populate('instrument')
        .sort({ validTill: -1 })
        .limit(5);

      return res.json({
        success: true,
        stats: {
          totalInstruments,
          activeInstruments,
          dueVerification,
          pendingApplications,
          expiringSoon
        },
        recentApplications,
        recentCertificates
      });
    }

    if (role === 'lmo' || role === 'gatc') {
      const pendingInspections = await Application.countDocuments({
        assignedTo: userId,
        status: 'scheduled'
      });

      const completedInspections = await Application.countDocuments({
        assignedTo: userId,
        status: { $in: ['verified', 'certified'] }
      });

      const rejectedInspections = await Application.countDocuments({
        assignedTo: userId,
        status: 'rejected'
      });

      const certificatesIssued = await Certificate.countDocuments({ issuedBy: userId });

      const assignedQueue = await Application.find({
        assignedTo: userId,
        status: 'scheduled'
      })
        .populate('applicant', 'name phone organizationName')
        .populate('instrument')
        .sort({ scheduledDate: 1 })
        .limit(6);

      return res.json({
        success: true,
        stats: {
          pendingInspections,
          completedInspections,
          rejectedInspections,
          certificatesIssued
        },
        assignedQueue
      });
    }

    if (role === 'admin') {
      const totalUsers = await User.countDocuments({ role: 'consumer' });
      const totalOfficers = await User.countDocuments({ role: { $in: ['lmo', 'gatc'] } });
      const totalInstruments = await Instrument.countDocuments();
      const totalApplications = await Application.countDocuments();
      
      const submittedApps = await Application.countDocuments({ status: 'submitted' });
      const scheduledApps = await Application.countDocuments({ status: 'scheduled' });
      const certifiedApps = await Application.countDocuments({ status: 'certified' });
      const rejectedApps = await Application.countDocuments({ status: 'rejected' });

      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      const expiringSoon = await Certificate.countDocuments({
        status: 'valid',
        validTill: { $lte: in30Days, $gte: new Date() }
      });

      const totalActiveCerts = await Certificate.countDocuments({ status: 'valid' });

      // Revenue Calculation
      const feeResult = await Application.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$stampingFee' } } }
      ]);
      const totalRevenue = feeResult[0]?.totalRevenue || 0;

      // Category breakdown
      const categoryBreakdown = await Instrument.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      // District breakdown
      const districtBreakdown = await Application.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]);

      // Status breakdown for charts
      const statusChartData = [
        { name: 'Submitted / Unassigned', value: submittedApps, color: '#F59E0B' },
        { name: 'Scheduled / In Inspection', value: scheduledApps, color: '#3B82F6' },
        { name: 'Certified / Active', value: certifiedApps, color: '#10B981' },
        { name: 'Rejected / Non-Compliant', value: rejectedApps, color: '#EF4444' }
      ];

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalOfficers,
          totalInstruments,
          totalApplications,
          submittedApps,
          scheduledApps,
          certifiedApps,
          rejectedApps,
          expiringSoon,
          totalActiveCerts,
          totalRevenue
        },
        categoryBreakdown,
        districtBreakdown,
        statusChartData
      });
    }

    res.json({ success: true, stats: {} });
  } catch (error) {
    next(error);
  }
};
