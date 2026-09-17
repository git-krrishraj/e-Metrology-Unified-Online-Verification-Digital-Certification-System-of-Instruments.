import cron from 'node-cron';
import { Certificate } from '../models/Certificate.js';
import { Notification } from '../models/Notification.js';
import { sendExpiryAlertEmail } from './emailService.js';

/**
 * Checks all active certificates and sends alerts for 30, 15, and 7 day expirations
 */
export const checkExpiringCertificates = async () => {
  try {
    console.log('⏰ [CRON] Starting daily Legal Metrology certificate expiry sweep...');
    const now = new Date();
    
    // Define thresholds in days
    const thresholds = [
      { days: 30, flag: 'day30' },
      { days: 15, flag: 'day15' },
      { days: 7, flag: 'day7' }
    ];

    let totalAlertsSent = 0;

    for (const threshold of thresholds) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + threshold.days);

      // Find active certificates expiring on or before target date where flag is false
      const query = {
        status: 'valid',
        validTill: { $lte: targetDate, $gte: now },
        [`renewalAlertsSent.${threshold.flag}`]: false
      };

      const certs = await Certificate.find(query)
        .populate('owner', 'name email phone')
        .populate('instrument', 'instrumentName serialNumber category model');

      for (const cert of certs) {
        if (!cert.owner || !cert.instrument) continue;

        const diffTime = new Date(cert.validTill) - now;
        const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // 1. Dispatch Email Alert
        await sendExpiryAlertEmail({
          toEmail: cert.owner.email,
          ownerName: cert.owner.name,
          instrumentName: cert.instrument.instrumentName,
          serialNumber: cert.instrument.serialNumber,
          certId: cert.certId,
          validTill: cert.validTill,
          daysRemaining
        });

        // 2. Create in-app Notification
        await Notification.create({
          recipient: cert.owner._id,
          title: `Expiry Notice: ${cert.instrument.instrumentName}`,
          message: `Your certificate (${cert.certId}) for ${cert.instrument.instrumentName} expires in ${daysRemaining} days. Please apply for re-verification to maintain statutory compliance.`,
          type: 'expiry_warning',
          link: `/consumer/instruments`
        });

        // 3. Mark alert as sent
        cert.renewalAlertsSent[threshold.flag] = true;
        await cert.save();
        totalAlertsSent++;
      }
    }

    // Also mark expired certificates as 'expired'
    const expiredCount = await Certificate.updateMany(
      { status: 'valid', validTill: { $lt: now } },
      { $set: { status: 'expired' } }
    );

    console.log(`✅ [CRON] Expiry sweep completed: ${totalAlertsSent} alert(s) sent, ${expiredCount.modifiedCount} certificate(s) transitioned to 'expired'.`);
    return { success: true, alertsSent: totalAlertsSent, expiredUpdated: expiredCount.modifiedCount };
  } catch (error) {
    console.error('❌ [CRON] Error during certificate expiry check:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initializes the cron scheduler
 */
export const initExpiryCronJob = () => {
  // Run daily at 00:00 (Midnight)
  cron.schedule('0 0 * * *', () => {
    checkExpiringCertificates();
  });
  console.log('🕒 Expiry monitor cron scheduled for 00:00 daily.');
};
