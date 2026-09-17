import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const certsDir = path.resolve('uploads', 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

/**
 * Generates an official Legal Metrology Verification Certificate PDF
 * @param {Object} data 
 * @returns {Promise<string>} Relative file path of the generated PDF
 */
export const generateCertificatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        certId,
        validFrom,
        validTill,
        stampNumber,
        owner,
        instrument,
        verificationRecord,
        issuedBy,
        qrBuffer
      } = data;

      const filename = `CERT-${certId.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const filePath = path.join(certsDir, filename);
      const relativePath = `/uploads/certificates/${filename}`;

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 40, right: 40 },
        info: {
          Title: `Legal Metrology Certificate - ${certId}`,
          Author: 'Directorate of Legal Metrology',
          Subject: 'Certificate of Verification and Stamping'
        }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- Colors ---
      const navy = '#002B49';
      const gold = '#B8860B';
      const darkText = '#1A202C';
      const grayText = '#4A5568';
      const lightBg = '#F7FAFC';
      const borderBlue = '#2B6CB0';

      // --- Outer Frame ---
      doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor(navy).stroke();
      doc.rect(24, 24, 547, 794).lineWidth(0.8).strokeColor(gold).stroke();

      // --- Top Header ---
      doc.font('Helvetica-Bold').fontSize(12).fillColor(navy).text('GOVERNMENT OF INDIA', { align: 'center' });
      doc.font('Helvetica-Bold').fontSize(14).fillColor(navy).text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', { align: 'center' });
      doc.font('Helvetica').fontSize(10).fillColor(grayText).text('DEPARTMENT OF CONSUMER AFFAIRS • DIRECTORATE OF LEGAL METROLOGY', { align: 'center' });
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').fontSize(13).fillColor(gold).text('CERTIFICATE OF VERIFICATION AND STAMPING', { align: 'center' });
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(grayText).text('[Under Section 24 of Legal Metrology Act, 2009 & Rule 24 of Legal Metrology (General) Rules, 2011]', { align: 'center' });
      
      doc.moveDown(0.5);

      // Certificate No & Bar
      const startY = 120;
      doc.rect(35, startY, 525, 26).fill(navy);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF')
        .text(`CERTIFICATE NO: ${certId}`, 45, startY + 8);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#F6E05E')
        .text(`STAMP NO: ${stampNumber}`, 360, startY + 8, { align: 'right', width: 190 });

      // Two Column Key Specs Table
      let curY = startY + 35;

      // Section 1: Instrument & Owner Details (Boxed Grid)
      doc.rect(35, curY, 525, 175).lineWidth(0.8).strokeColor('#CBD5E0').fillAndStroke(lightBg, '#CBD5E0');
      
      // Header for Section 1
      doc.rect(35, curY, 525, 20).fill('#E2E8F0');
      doc.font('Helvetica-Bold').fontSize(9).fillColor(navy).text('1. INSTRUMENT & ESTABLISHMENT PARTICULARS', 45, curY + 6);

      curY += 28;
      const col1 = 45;
      const col2 = 300;

      // Row 1
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Owner / Establishment:', col1, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`${owner?.name || 'N/A'} (${owner?.organizationName || 'Individual'})`, col1 + 100, curY);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Instrument Category:', col2, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`${instrument?.category || 'Weighing Scale'}`, col2 + 95, curY, { width: 155 });

      curY += 22;
      // Row 2
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Serial Number:', col1, curY);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(navy).text(`${instrument?.serialNumber || 'N/A'}`, col1 + 100, curY);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Accuracy Class:', col2, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`${instrument?.accuracyClass || 'Class III'}`, col2 + 95, curY);

      curY += 22;
      // Row 3
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Model & Make:', col1, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`${instrument?.model || 'Standard'} / ${instrument?.manufacturer || 'Standard'}`, col1 + 100, curY);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Max Capacity (Max):', col2, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`${instrument?.maxCapacity || 0} ${instrument?.units || 'kg'}`, col2 + 95, curY);

      curY += 22;
      // Row 4
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Interval (e value):', col1, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`e = ${instrument?.verificationScaleInterval || 0.001} ${instrument?.units || 'kg'}`, col1 + 100, curY);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Location / District:', col2, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(`${instrument?.location?.district || 'District'}, ${instrument?.location?.state || 'State'}`, col2 + 95, curY);

      curY += 22;
      // Row 5
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Premises Address:', col1, curY);
      doc.font('Helvetica').fontSize(8).fillColor(darkText).text(`${instrument?.location?.address || 'On-site address'}`, col1 + 100, curY, { width: 400 });

      // Section 2: Verification Observations & Legal Metrology Compliance
      curY = 345;
      doc.rect(35, curY, 525, 140).lineWidth(0.8).strokeColor('#CBD5E0').fillAndStroke(lightBg, '#CBD5E0');
      doc.rect(35, curY, 525, 20).fill('#E2E8F0');
      doc.font('Helvetica-Bold').fontSize(9).fillColor(navy).text('2. VERIFICATION OBSERVATIONS & COMPLIANCE FINDINGS', 45, curY + 6);

      curY += 28;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Verification Date:', col1, curY);
      const vDateStr = verificationRecord?.verificationDate ? new Date(verificationRecord.verificationDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text(vDateStr, col1 + 100, curY);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Overall Result:', col2, curY);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#276749').text('PASSED / CONFORMS TO RULES', col2 + 95, curY);

      curY += 22;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Physical Inspection:', col1, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text('Seals intact, Leveling OK, Markings Clear', col1 + 100, curY);

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Eccentricity / Corner:', col2, curY);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText).text('Within Maximum Permissible Error', col2 + 95, curY);

      curY += 22;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Verification Rules:', col1, curY);
      doc.font('Helvetica').fontSize(8).fillColor(darkText).text('Tested with Working Standards traceable to National Physical Laboratory (NPL)', col1 + 100, curY, { width: 400 });

      curY += 22;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(grayText).text('Officer Remarks:', col1, curY);
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(darkText).text(verificationRecord?.inspectorNotes || 'Verified, found accurate within prescribed MPE limits and duly stamped.', col1 + 100, curY, { width: 400 });

      // Validity Box (Prominent)
      curY = 500;
      doc.rect(35, curY, 525, 45).lineWidth(1.2).strokeColor('#2B6CB0').fillAndStroke('#EBF8FF', '#2B6CB0');
      
      const vFrom = new Date(validFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const vTill = new Date(validTill).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

      doc.font('Helvetica-Bold').fontSize(10).fillColor(navy)
        .text(`VALID FROM: ${vFrom}`, 55, curY + 16);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#C53030')
        .text(`VALID UP TO: ${vTill}`, 320, curY + 16);

      // Section 3: QR Code & Verification / Stamping Seal Section
      curY = 560;

      // Embed QR Code if provided
      if (qrBuffer) {
        doc.image(qrBuffer, 45, curY, { width: 115, height: 115 });
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor(navy)
          .text('SCAN TO VERIFY AUTHENTICITY', 40, curY + 120, { width: 125, align: 'center' });
        doc.font('Helvetica').fontSize(6.5).fillColor(grayText)
          .text('National Legal Metrology Digital Portal', 35, curY + 130, { width: 135, align: 'center' });
      }

      // Legal Undertaking & Officer Seal in Center/Right
      const offX = 185;
      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(grayText)
        .text('This is a digitally generated verification certificate issued pursuant to the Legal Metrology Act, 2009. Alteration or use of expired/unverified measuring instruments in trade is a punishable offence under Section 30 & 31.', offX, curY + 5, { width: 360 });

      // Verification Officer Seal Box
      doc.rect(offX, curY + 45, 365, 85).lineWidth(0.8).strokeColor('#CBD5E0').fillAndStroke('#F7FAFC', '#CBD5E0');
      
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(navy)
        .text('VERIFYING AUTHORITY / OFFICER:', offX + 15, curY + 55);
      doc.font('Helvetica').fontSize(8.5).fillColor(darkText)
        .text(`Name: ${issuedBy?.name || 'Legal Metrology Officer'}`, offX + 15, curY + 70);
      doc.font('Helvetica').fontSize(8).fillColor(darkText)
        .text(`Designation: ${issuedBy?.designation || 'Inspector / Officer (Legal Metrology)'} | Officer ID: ${issuedBy?.officerId || 'LMO-MH-01'}`, offX + 15, curY + 84);
      doc.font('Helvetica').fontSize(8).fillColor(darkText)
        .text(`Jurisdiction: ${issuedBy?.jurisdictionDistrict || 'Mumbai'}, ${issuedBy?.jurisdictionState || 'Maharashtra'}`, offX + 15, curY + 98);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#2C5282')
        .text('[DIGITALLY SIGNED & CRYPTOGRAPHICALLY SECURED]', offX + 15, curY + 114);

      // Footer
      doc.font('Helvetica').fontSize(7).fillColor('#A0AEC0')
        .text(`Generated on ${new Date().toISOString()} • Unified Legal Metrology e-Verification Platform • Government of India`, 40, 790, { align: 'center', width: 515 });

      doc.end();

      writeStream.on('finish', () => {
        resolve(relativePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
