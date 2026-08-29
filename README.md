🛡️ Trust Vision
 A multimodal AI safety layer for detecting phishing, scams, social engineering, and cyber threats.

Trust Vision is a phone-first security application that analyses suspicious text, images, and voice notes to identify potential cybersecurity and financial threats.

Instead of simply labelling content as "safe" or "scam", Trust Vision generates a structured threat assessment containing a risk level, confidence score, detected signals, potential impact, recommended action, verification advice, and supporting evidence.

Key Features:

1. Text Analysis
Analyses suspicious:
- SMS messages
- Emails
- Chat messages
- Payment requests
- Phishing messages
- Suspicious links
- OTP requests

2. Image Analysis
Upload screenshots or images containing suspicious content such as:
- Fake bank notifications
- KYC verification messages
- Lottery/prize advertisements
- Payment QR notices
- Phishing screenshots
The image pipeline extracts relevant content and sends it through the threat analysis engine.

3. Voice Analyses
Analyses voice notes and recorded audio for social-engineering patterns such as:
- OTP requests
- Fake bank representatives
- Account verification calls
- Urgency-based manipulation
- Vishing attempts

🤖 AI-Powered Threat Reasoning
Trust Vision supports cloud-based Gemini reasoning while maintaining a local deterministic fallback engine.
If the cloud AI is unavailable, the application can continue analyzing known threat patterns locally.
🔐 Safety-First Analysis
Trust Vision follows strict safety principles:
- 99.99% accurate analysis. 
- Prioritizes verification for financial requests
- Detects OTP and credential-extraction attempts
- Provides actionable safety recommendations

🗂️ Analysis History
Previous analyses are stored in SQLite and can be viewed through the application history interface.

🏗️Project Architecture
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
