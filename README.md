SIH Project - 2

# Unified Online Verification & Digital Certification System for Legal Metrology

> Built for statutory compliance with the **Legal Metrology Act, 2009** and **Legal Metrology (General) Rules, 2011**.

---

## 🏛️ Project Overview

In commercial trade, every weighing and measuring instrument (counter scales, weighbridges, petrol dispensers, lab balances) must be periodically inspected, calibrated, verified, and stamped by **Legal Metrology Officers (LMOs)** or **Government Approved Test Centres (GATCs)** under Section 24 of the Legal Metrology Act, 2009.

This system digitizes the complete statutory lifecycle:
$$\text{Registration} \longrightarrow \text{Application} \longrightarrow \text{Workload-Aware Allocation} \longrightarrow \text{Digital Inspection (MPE)} \longrightarrow \text{Cryptographic QR Certificate} \longrightarrow \text{Automated Expiry Alerts}$$

---

## 🛠️ Technology Stack & Policy

### Core Backbone (Non-Negotiable MERN)
- **Frontend**: React.js (v18) + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express.js (Single Monolith)
- **Database**: MongoDB + Mongoose (relational schema population & compound indexing)
- **Authentication**: JWT + bcryptjs (Role-based access control across 4 personas)

### Supplementary Tech (Sitting on Top of MERN)
| Tool / Library | Role & Justification |
| :--- | :--- |
| **`pdfkit`** | Generates official Government of India Schedule X certificates with embedded QR codes purely in Node.js without the 400MB+ memory footprint or container crashes of headless Chrome / Puppeteer. |
| **`qrcode` + HMAC-SHA256** | Generates tamper-proof QR codes encoding `https://.../verify/:certId?token=...` signed with server secret so certificate IDs cannot be guessed or forged. |
| **`node-cron`** | Lightweight in-process scheduler executing daily 30/15/7-day renewal checks without external message broker overhead. |
| **`nodemailer`** | Dispatches statutory renewal reminder notices with automatic fallback to Ethereal/Console logging. |
| **PWA + IndexedDB (`idb`)** | Mobile-first responsive PWA with Service Worker caching and an IndexedDB offline queue so field officers can capture inspections and photos (`capture="environment"`) in low-connectivity areas and auto-sync when online. |
| **`recharts`** | Renders analytics charts for verification status pipeline, volume trends, and district distributions. |

---

## 👥 Stakeholder Roles & 1-Click Demo Logins

The application includes an **instant 1-Click Role Switcher** on the Navbar and Login page:

| Role | Demo Email | Password | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Directorate Admin** | `admin@metrology.gov.in` | `Admin@1234` | System-wide oversight, workload-aware LMO allocation, master registry, expiry compliance sweeps. |
| **Legal Metrology Officer (LMO)** | `lmo.mumbai@metrology.gov.in` | `Officer@1234` | Assigned queue, digital inspection checklist, live MPE load testing, photo capture, stamp issuing. |
| **GATC Testing Centre** | `gatc.central@metrology.gov.in` | `Gatc@1234` | Laboratory calibration for high-precision Class I/II balances with identical statutory stamping powers. |
| **Consumer / Retailer** | `retailer.rajesh@gmail.com` | `Owner@1234` | Instrument registration, verification applications, certificate vault, 1-click renewal. |
| **Weighbridge Operator** | `industrial.steel@gmail.com` | `Owner@1234` | Heavy 50-Ton weighbridge registration and annual stamping management. |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or MongoDB Atlas). *Note: If a local MongoDB instance is not detected, the backend automatically activates an embedded in-memory database and auto-seeds all test accounts and verifiable certificates.*

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo accounts, instruments, and valid certificates
npm start        # Runs Express API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Vite React SPA on http://localhost:5173
```

---

## 🔄 End-to-End Workflow Demonstration

1. **Owner Application**: Login as `retailer.rajesh@gmail.com` $\rightarrow$ Go to **Register Instrument** $\rightarrow$ Fill specifications $\rightarrow$ Click **Apply Verification**.
2. **Admin Allocation**: Login as `admin@metrology.gov.in` $\rightarrow$ Go to **Application Allocation** $\rightarrow$ Use **Auto-Assign** or pick an officer with the lowest active workload $\rightarrow$ Confirm appointment date.
3. **Officer Digital Inspection**: Login as `lmo.mumbai@metrology.gov.in` $\rightarrow$ Go to **Assigned Queue** $\rightarrow$ Open **Digital Inspection** $\rightarrow$ Fill visual checks, test load readings (MPE tolerances validate live in green/red), assign Stamp Number, capture photo $\rightarrow$ Submit **PASS**.
4. **Certificate Issuance & QR Verification**: System generates cryptographic HMAC token, QR Code, and PDF certificate.
5. **Public Authenticity Scan**: Visit `/verify/:certId` without logging in $\rightarrow$ Green **"VERIFIED & STATUTORILY VALID"** status banner renders with complete specs, officer stamp details, and direct PDF download.
6. **Expiry Alerts**: Admin clicks **Trigger Expiry Sweep** in **Expiry & Compliance** $\rightarrow$ Daily cron queries 30/15/7-day windows, sends Nodemailer alerts, and creates in-app notifications.

---

## 📜 Compliance Mapping
- **Section 24, Legal Metrology Act, 2009**: Verification & Stamping of weight or measure.
- **Rule 24, Legal Metrology (General) Rules, 2011**: Mandatory Certificate of Verification (Schedule X format).
- **Schedule VII & OIML R 76**: Maximum Permissible Error (MPE) thresholds for Class I, II, III, and IIII weighing instruments.
