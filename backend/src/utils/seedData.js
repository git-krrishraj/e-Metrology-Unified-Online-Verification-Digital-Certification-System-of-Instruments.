import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import { User } from '../models/User.js';
import { Instrument } from '../models/Instrument.js';
import { Application } from '../models/Application.js';
import { VerificationRecord } from '../models/VerificationRecord.js';
import { Certificate } from '../models/Certificate.js';
import { Notification } from '../models/Notification.js';
import { Jurisdiction } from '../models/Jurisdiction.js';

import { generateVerificationQRCode } from '../services/qrService.js';
import { generateCertificatePDF } from '../services/pdfService.js';

export const seedDatabase = async (isAutoSeed = false) => {
  try {
    if (!isAutoSeed) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legal_metrology';
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB for seeding...');
    }

    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0 && isAutoSeed) {
      console.log('ℹ️  Database already contains records. Skipping auto-seeding.');
      return;
    }

    // Clear old records
    await User.deleteMany({});
    await Instrument.deleteMany({});
    await Application.deleteMany({});
    await VerificationRecord.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});
    await Jurisdiction.deleteMany({});

    console.log('🧹 Preparing fresh Legal Metrology sample database...');

    // 1. Seed Jurisdictions
    await Jurisdiction.insertMany([
      { districtName: 'Mumbai City', state: 'Maharashtra', zoneCode: 'WZ-01', headquarters: 'Old Custom House, Fort' },
      { districtName: 'Mumbai Suburban', state: 'Maharashtra', zoneCode: 'WZ-02', headquarters: 'Bandra Kurla Complex' },
      { districtName: 'Thane', state: 'Maharashtra', zoneCode: 'WZ-03', headquarters: 'Naupada, Thane West' },
      { districtName: 'Pune', state: 'Maharashtra', zoneCode: 'PZ-01', headquarters: 'Shivajinagar, Pune' },
      { districtName: 'Nagpur', state: 'Maharashtra', zoneCode: 'NZ-01', headquarters: 'Civil Lines, Nagpur' }
    ]);

    // 2. Seed Users
    const adminUser = await User.create({
      name: 'Dr. Suresh V. Verma',
      email: 'admin@metrology.gov.in',
      password: 'Admin@1234',
      role: 'admin',
      phone: '+91 9820011223',
      organizationName: 'Directorate of Legal Metrology HQ',
      designation: 'Controller of Legal Metrology',
      jurisdictionDistrict: 'Mumbai City'
    });

    const lmoOfficer = await User.create({
      name: 'Anil R. Kulkarni',
      email: 'lmo.mumbai@metrology.gov.in',
      password: 'Officer@1234',
      role: 'lmo',
      phone: '+91 9820033445',
      officerId: 'LMO-MH-042',
      designation: 'Inspector of Legal Metrology',
      jurisdictionDistrict: 'Mumbai City',
      jurisdictionState: 'Maharashtra'
    });

    const gatcCentre = await User.create({
      name: 'National Test & Metrology Centre',
      email: 'gatc.central@metrology.gov.in',
      password: 'Gatc@1234',
      role: 'gatc',
      phone: '+91 9820055667',
      officerId: 'GATC-IND-01',
      organizationName: 'Govt Approved Regional Calibration Lab',
      designation: 'Senior Technical Metrologist',
      jurisdictionDistrict: 'Mumbai Suburban',
      jurisdictionState: 'Maharashtra'
    });

    const consumerRajesh = await User.create({
      name: 'Rajesh Sharma',
      email: 'retailer.rajesh@gmail.com',
      password: 'Owner@1234',
      role: 'consumer',
      phone: '+91 9820077889',
      organizationName: 'Rajesh Supermarket & Provisions',
      tradeLicenseNo: 'TL-MCGM-2022-8819',
      gstin: '27AABCR1234M1Z5'
    });

    const consumerSteel = await User.create({
      name: 'Apex Logistics Ltd.',
      email: 'industrial.steel@gmail.com',
      password: 'Owner@1234',
      role: 'consumer',
      phone: '+91 9820099001',
      organizationName: 'Apex Heavy Transport & Logistics Yard',
      tradeLicenseNo: 'TL-THANE-2021-4092',
      gstin: '27AABCA5566K1Z2'
    });

    // 3. Seed Instruments
    const inst1 = await Instrument.create({
      owner: consumerRajesh._id,
      instrumentName: 'Counter Weighing Scale #1 (Billing Counter)',
      category: 'Counter / Platform Scale',
      accuracyClass: 'Class III (Medium Accuracy - Commercial Trade)',
      model: 'Essae DS-215 Precision',
      serialNumber: 'ESS-2024-88391',
      manufacturer: 'Essae-Teraoka Ltd.',
      yearOfManufacture: 2024,
      maxCapacity: 30,
      minCapacity: 0.1,
      verificationScaleInterval: 0.005, // e = 5g
      units: 'kg',
      location: {
        establishmentName: 'Rajesh Supermarket & Provisions',
        address: 'Shop No. 4, Ground Floor, Crawford Market',
        district: 'Mumbai City',
        state: 'Maharashtra',
        pincode: '400001'
      },
      status: 'active'
    });

    const inst2 = await Instrument.create({
      owner: consumerRajesh._id,
      instrumentName: 'Dry Fruits Precision Table Scale',
      category: 'Non-Automatic Weighing Instrument (NAWI)',
      accuracyClass: 'Class II (High Accuracy)',
      model: 'Citizen CY-204',
      serialNumber: 'CTZ-2023-44120',
      manufacturer: 'Citizen Scale India Pvt. Ltd.',
      yearOfManufacture: 2023,
      maxCapacity: 5,
      minCapacity: 0.02,
      verificationScaleInterval: 0.0001, // e = 0.1g
      units: 'kg',
      location: {
        establishmentName: 'Rajesh Supermarket - Dry Fruits Section',
        address: 'Shop No. 5, Ground Floor, Crawford Market',
        district: 'Mumbai City',
        state: 'Maharashtra',
        pincode: '400001'
      },
      status: 'active'
    });

    const inst3 = await Instrument.create({
      owner: consumerSteel._id,
      instrumentName: 'Heavy Duty 50 Ton Weighbridge',
      category: 'Electronic Weighbridge',
      accuracyClass: 'Class IIII (Ordinary Accuracy - Heavy Industrial)',
      model: 'Avery Weigh-Tronix E1205',
      serialNumber: 'AVW-2022-99014',
      manufacturer: 'Avery India Ltd.',
      yearOfManufacture: 2022,
      maxCapacity: 50000,
      minCapacity: 200,
      verificationScaleInterval: 10, // e = 10kg
      units: 'kg',
      location: {
        establishmentName: 'Apex Transport Depot #2',
        address: 'Plot 42, MIDC Industrial Area, Turbhe',
        district: 'Thane',
        state: 'Maharashtra',
        pincode: '400705'
      },
      status: 'due_verification'
    });

    const inst4 = await Instrument.create({
      owner: consumerRajesh._id,
      instrumentName: 'Grains Bulk Platform Scale (150kg)',
      category: 'Counter / Platform Scale',
      accuracyClass: 'Class III (Medium Accuracy - Commercial Trade)',
      model: 'Phoenix PHS-150',
      serialNumber: 'PHX-2025-10294',
      manufacturer: 'Phoenix Scales India',
      yearOfManufacture: 2025,
      maxCapacity: 150,
      minCapacity: 1,
      verificationScaleInterval: 0.02, // e = 20g
      units: 'kg',
      location: {
        establishmentName: 'Rajesh Provisions Godown',
        address: 'Gala 12, APMC Market Yard, Vashi',
        district: 'Mumbai City',
        state: 'Maharashtra',
        pincode: '400703'
      },
      status: 'in_process'
    });

    // 4. Seed Verified Certificate 1 (Active, Valid for 1 year)
    const cert1Id = 'LMA-MH-2026-10492';
    const stamp1No = 'MH/LMO-042/2026/0891';
    const validFrom1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const validTill1 = new Date(Date.now() + 335 * 24 * 60 * 60 * 1000);

    const { qrToken: qrToken1, qrCodeDataUrl: qrUrl1, qrBuffer: qrBuf1 } = await generateVerificationQRCode(
      cert1Id,
      validTill1,
      stamp1No
    );

    const app1 = await Application.create({
      applicationNo: 'APP-2026-00101',
      instrument: inst1._id,
      applicant: consumerRajesh._id,
      applicationType: 'periodic_reverification',
      status: 'certified',
      assignedTo: lmoOfficer._id,
      assignedBy: adminUser._id,
      assignedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      scheduledDate: validFrom1,
      district: 'Mumbai City',
      stampingFee: 350,
      paymentStatus: 'paid'
    });

    const vRecord1 = await VerificationRecord.create({
      application: app1._id,
      instrument: inst1._id,
      verifiedBy: lmoOfficer._id,
      verificationDate: validFrom1,
      visualChecklist: {
        sealIntact: true,
        levelIndicatorAligned: true,
        noPhysicalDamage: true,
        markingPlateLegible: true,
        stampingPlugsAccessible: true
      },
      testReadings: [
        { testIndex: 1, testLoadKg: 5, observedReadingKg: 5.000, errorKg: 0, maxAllowedErrorKg: 0.005, passed: true },
        { testIndex: 2, testLoadKg: 15, observedReadingKg: 15.002, errorKg: 0.002, maxAllowedErrorKg: 0.010, passed: true },
        { testIndex: 3, testLoadKg: 30, observedReadingKg: 29.998, errorKg: -0.002, maxAllowedErrorKg: 0.015, passed: true }
      ],
      overallResult: 'pass',
      stampNumberAssigned: stamp1No,
      inspectorNotes: 'Instrument checked in trade premises with calibrated Class M1 working standards. Fully compliant with Legal Metrology (General) Rules 2011.'
    });

    const pdfPath1 = await generateCertificatePDF({
      certId: cert1Id,
      validFrom: validFrom1,
      validTill: validTill1,
      stampNumber: stamp1No,
      owner: consumerRajesh,
      instrument: inst1,
      verificationRecord: vRecord1,
      issuedBy: lmoOfficer,
      qrBuffer: qrBuf1
    });

    const cert1 = await Certificate.create({
      certId: cert1Id,
      verificationRecord: vRecord1._id,
      application: app1._id,
      instrument: inst1._id,
      owner: consumerRajesh._id,
      issuedBy: lmoOfficer._id,
      stampNumber: stamp1No,
      qrToken: qrToken1,
      qrCodeDataUrl: qrUrl1,
      pdfPath: pdfPath1,
      validFrom: validFrom1,
      validTill: validTill1,
      status: 'valid'
    });

    app1.verificationRecord = vRecord1._id;
    app1.certificate = cert1._id;
    await app1.save();

    inst1.currentCertificate = cert1._id;
    inst1.lastVerifiedAt = validFrom1;
    await inst1.save();

    // 5. Seed Certificate 2 (Expiring in 10 days)
    const cert2Id = 'LMA-MH-2025-07821';
    const stamp2No = 'MH/LMO-042/2025/4410';
    const validFrom2 = new Date(Date.now() - 355 * 24 * 60 * 60 * 1000);
    const validTill2 = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const { qrToken: qrToken2, qrCodeDataUrl: qrUrl2, qrBuffer: qrBuf2 } = await generateVerificationQRCode(
      cert2Id,
      validTill2,
      stamp2No
    );

    const app2 = await Application.create({
      applicationNo: 'APP-2025-00892',
      instrument: inst2._id,
      applicant: consumerRajesh._id,
      applicationType: 'periodic_reverification',
      status: 'certified',
      assignedTo: lmoOfficer._id,
      assignedBy: adminUser._id,
      scheduledDate: validFrom2,
      district: 'Mumbai City',
      stampingFee: 350,
      paymentStatus: 'paid'
    });

    const vRecord2 = await VerificationRecord.create({
      application: app2._id,
      instrument: inst2._id,
      verifiedBy: lmoOfficer._id,
      verificationDate: validFrom2,
      visualChecklist: {
        sealIntact: true,
        levelIndicatorAligned: true,
        noPhysicalDamage: true,
        markingPlateLegible: true,
        stampingPlugsAccessible: true
      },
      testReadings: [
        { testIndex: 1, testLoadKg: 1, observedReadingKg: 1.0000, errorKg: 0, maxAllowedErrorKg: 0.0002, passed: true },
        { testIndex: 2, testLoadKg: 5, observedReadingKg: 5.0001, errorKg: 0.0001, maxAllowedErrorKg: 0.0003, passed: true }
      ],
      overallResult: 'pass',
      stampNumberAssigned: stamp2No,
      inspectorNotes: 'High precision Class II electronic balance verified with F1 test weights.'
    });

    const pdfPath2 = await generateCertificatePDF({
      certId: cert2Id,
      validFrom: validFrom2,
      validTill: validTill2,
      stampNumber: stamp2No,
      owner: consumerRajesh,
      instrument: inst2,
      verificationRecord: vRecord2,
      issuedBy: lmoOfficer,
      qrBuffer: qrBuf2
    });

    const cert2 = await Certificate.create({
      certId: cert2Id,
      verificationRecord: vRecord2._id,
      application: app2._id,
      instrument: inst2._id,
      owner: consumerRajesh._id,
      issuedBy: lmoOfficer._id,
      stampNumber: stamp2No,
      qrToken: qrToken2,
      qrCodeDataUrl: qrUrl2,
      pdfPath: pdfPath2,
      validFrom: validFrom2,
      validTill: validTill2,
      status: 'valid'
    });

    app2.verificationRecord = vRecord2._id;
    app2.certificate = cert2._id;
    await app2.save();

    inst2.currentCertificate = cert2._id;
    inst2.lastVerifiedAt = validFrom2;
    await inst2.save();

    // 6. Seed Scheduled Application in LMO Queue
    const app3 = await Application.create({
      applicationNo: 'APP-2026-00441',
      instrument: inst4._id,
      applicant: consumerRajesh._id,
      applicationType: 'initial_verification',
      status: 'scheduled',
      assignedTo: lmoOfficer._id,
      assignedBy: adminUser._id,
      assignedAt: new Date(),
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      district: 'Mumbai City',
      stampingFee: 350,
      paymentStatus: 'paid',
      remarks: 'New commercial counter platform scale installed at Godown. Please verify.'
    });

    // 7. Seed Unassigned Application
    const app4 = await Application.create({
      applicationNo: 'APP-2026-00508',
      instrument: inst3._id,
      applicant: consumerSteel._id,
      applicationType: 'periodic_reverification',
      status: 'submitted',
      district: 'Thane',
      stampingFee: 1500,
      paymentStatus: 'paid',
      remarks: 'Annual re-verification due for 50 Ton Avery weighbridge.'
    });

    // 8. Seed Initial Notifications
    await Notification.create([
      {
        recipient: consumerRajesh._id,
        title: '⚠️ Statutory Renewal Notice: Dry Fruits Table Scale',
        message: `Your certificate (${cert2Id}) expires in 10 days on ${validTill2.toLocaleDateString('en-IN')}. Please apply for periodic re-verification immediately to avoid penalties.`,
        type: 'expiry_warning',
        link: '/consumer/instruments'
      },
      {
        recipient: lmoOfficer._id,
        title: 'Scheduled Verification Appointment',
        message: `Inspection scheduled for Rajesh Provisions Godown (Application ${app3.applicationNo}) on ${new Date(app3.scheduledDate).toLocaleDateString('en-IN')}.`,
        type: 'allocation',
        link: '/officer/queue'
      },
      {
        recipient: adminUser._id,
        title: 'New Verification Application Pending Allocation',
        message: `Application ${app4.applicationNo} from Apex Logistics Ltd. in Thane requires officer assignment.`,
        type: 'application_status',
        link: '/admin/allocation'
      }
    ]);

    console.log('✅ Legal Metrology database seeded successfully!');
    if (!isAutoSeed) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    if (!isAutoSeed) process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase(false);
}
