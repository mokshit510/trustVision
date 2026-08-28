# 🛡️ TrustVision

> **A multimodal AI safety layer for detecting phishing, scams, social engineering, and cyber threats.**

TrustVision is a phone-first security application that analyzes suspicious **text, images, and voice notes** to identify potential cybersecurity and financial threats.

Instead of simply labeling content as "safe" or "scam", TrustVision generates a structured threat assessment containing a **risk level, confidence score, detected signals, potential impact, recommended action, verification advice, and supporting evidence**.

---

## ✨ Features

### 🔤 Text Analysis

Analyze suspicious:

- SMS messages
- Emails
- Chat messages
- Payment requests
- Phishing messages
- Suspicious links
- OTP requests

### 🖼️ Image Analysis

Upload screenshots or images containing suspicious content such as:

- Fake bank notifications
- KYC verification messages
- Lottery/prize advertisements
- Payment QR notices
- Phishing screenshots

The image pipeline extracts relevant content and sends it through the threat analysis engine.

### 🎙️ Voice Analysis

Analyze voice notes and recorded audio for social-engineering patterns such as:

- OTP requests
- Fake bank representatives
- Account verification calls
- Urgency-based manipulation
- Vishing attempts

### 🤖 AI-Powered Threat Reasoning

TrustVision supports cloud-based Gemini reasoning while maintaining a local deterministic fallback engine.

If the cloud AI is unavailable, the application can continue analyzing known threat patterns locally.

### 🔐 Safety-First Analysis

TrustVision follows strict safety principles:

- Never claims 100% certainty
- Uses probabilistic risk assessments
- Prioritizes verification for financial requests
- Detects OTP and credential-extraction attempts
- Provides actionable safety recommendations

### 📊 Risk Assessment

Every analysis produces structured information including:

- Risk level
- Confidence score
- Threat summary
- Detected signals
- Why it matters
- Potential impact
- Recommended action
- Verification advice
- Evidence

### 🗂️ Analysis History

Previous analyses are stored in SQLite and can be viewed through the application history interface.

---

## 🎯 Demo Scenarios

TrustVision includes preset scenarios for demonstrating the system.

### 1. 🏦 Bank KYC Block Scam

Example:

> Your bank account will be blocked within 30 minutes. Complete KYC immediately using the provided link.

Detected indicators:

- Artificial urgency
- Account suspension threat
- Suspicious external link
- KYC information request

Expected result:

**High Risk**

---

### 2. 🎁 Lottery Prize Scam

Example:

> Congratulations! You won ₹25,000. Pay ₹499 processing fee to claim your prize via UPI.

Detected indicators:

- Unsolicited prize
- Advance-fee request
- Financial transaction
- UPI payment request

Expected result:

**Potentially Dangerous**

---

### 3. 📞 Fake Bank Agent / OTP Scam

Example:

> I'm calling from your bank. Tell me the OTP you just received to verify your account.

Detected indicators:

- Bank impersonation
- OTP extraction
- Social engineering
- Manufactured urgency

Expected result:

**High Risk**

---

## 🏗️ Project Architecture

```text
trustVision/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── analyzeController.js
│   │   │   ├── feedbackController.js
│   │   │   └── historyController.js
│   │   │
│   │   ├── database/
│   │   │   └── db.js
│   │   │
│   │   ├── routes/
│   │   │   └── index.js
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── historyService.js
│   │   │   ├── riskAnalysisService.js
│   │   │   ├── speechService.js
│   │   │   └── visionService.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   ├── schema.sql
│   └── trustvision.db
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisResultModal.jsx
│   │   │   ├── DemoPresets.jsx
│   │   │   ├── HistoryList.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ScanInputSection.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── HomeDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   └── styles/
│   │       ├── global.css
│   │       └── variables.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── shared/
│   ├── src/
│   │   ├── constants.js
│   │   ├── index.js
│   │   └── types.js
│   │
│   └── package.json
│
├── .gitignore
├── package.json
├── README.md
└── server.py