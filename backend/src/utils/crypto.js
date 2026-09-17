import crypto from 'crypto';

const SECRET = process.env.QR_HMAC_SECRET || 'hmac_secret_for_tamper_proof_legal_metrology_certificates_2026';

/**
 * Generates an HMAC-SHA256 token for a certificate
 * @param {string} certId 
 * @param {string|Date} validTill 
 * @param {string} stampNumber 
 * @returns {string} Hex HMAC token
 */
export const generateCertificateToken = (certId, validTill, stampNumber) => {
  const dateStr = new Date(validTill).toISOString().split('T')[0];
  const payload = `${certId}|${dateStr}|${stampNumber || 'STAMP'}`;
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
};

/**
 * Verifies if an HMAC-SHA256 token matches certificate data
 * @param {string} token 
 * @param {string} certId 
 * @param {string|Date} validTill 
 * @param {string} stampNumber 
 * @returns {boolean}
 */
export const verifyCertificateToken = (token, certId, validTill, stampNumber) => {
  if (!token) return false;
  const expectedToken = generateCertificateToken(certId, validTill, stampNumber);
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expectedToken, 'hex'));
  } catch {
    return token === expectedToken;
  }
};
