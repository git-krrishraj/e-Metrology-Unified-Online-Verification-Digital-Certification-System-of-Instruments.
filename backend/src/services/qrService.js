import QRCode from 'qrcode';
import { generateCertificateToken } from '../utils/crypto.js';

/**
 * Generates a high-resolution QR Code containing the signed verification URL
 * @param {string} certId 
 * @param {Date|string} validTill 
 * @param {string} stampNumber 
 * @returns {Promise<{ qrToken: string, qrCodeDataUrl: string, qrBuffer: Buffer, verificationUrl: string }>}
 */
export const generateVerificationQRCode = async (certId, validTill, stampNumber) => {
  const qrToken = generateCertificateToken(certId, validTill, stampNumber);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify/${encodeURIComponent(certId)}?token=${qrToken}`;

  const qrOptions = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 2,
    color: {
      dark: '#002B49',
      light: '#FFFFFF'
    },
    width: 300
  };

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, qrOptions);
  const qrBuffer = await QRCode.toBuffer(verificationUrl, qrOptions);

  return {
    qrToken,
    qrCodeDataUrl,
    qrBuffer,
    verificationUrl
  };
};
