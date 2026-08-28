import os
import sys
import json
import sqlite3
import re
import time
from urllib.parse import parse_qs, urlparse
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5000
DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'trustvision.db')

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            modality TEXT NOT NULL,
            input_summary TEXT,
            raw_input TEXT,
            risk_level TEXT NOT NULL,
            confidence REAL NOT NULL,
            summary TEXT NOT NULL,
            why_it_matters TEXT,
            potential_impact TEXT,
            recommended_action TEXT,
            verification_advice TEXT,
            result_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id TEXT NOT NULL,
            category TEXT,
            title TEXT NOT NULL,
            detail TEXT NOT NULL,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            analysis_id TEXT NOT NULL,
            is_helpful INTEGER NOT NULL,
            comments TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def sanitize_safety_text(text):
    sanitized = text
    forbidden = [
        'definitely a scam', '100% a scam', 'guaranteed fraud', 
        'is certainly malicious', 'without a doubt a scam', 'this is a scam for sure'
    ]
    for phrase in forbidden:
        sanitized = re.sub(re.escape(phrase), 'appears potentially dangerous', sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r'100%\s*(certain|guaranteed|scam|fraud)', 'high probability of potential risk', sanitized, flags=re.IGNORECASE)
    return sanitized

def run_threat_engine(raw_text, modality):
    text_lower = raw_text.lower()

    if len(raw_text.strip()) < 5:
        return {
            "id": f"analysis-{int(time.time()*1000)}",
            "modality": modality,
            "riskLevel": "insufficient_evidence",
            "confidence": 0.3,
            "summary": "Insufficient input content provided to perform threat evaluation.",
            "signals": ["Very short or vague input snippet provided."],
            "whyItMatters": "Safety analysis requires sufficient text, visual elements, or speech content to detect scam indicators.",
            "potentialImpact": "Risk level cannot be determined safely.",
            "recommendedAction": "Provide additional context, full message text, or a clearer image/voice note.",
            "verificationAdvice": "Do not click links or share credentials until full details can be verified.",
            "evidence": [{"category": "metadata", "title": "Low Context Input", "detail": "Input content was under 5 characters."}],
            "createdAt": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }

    # Check Demo 1: Bank KYC SMS
    if "blocked" in text_lower or ("kyc" in text_lower and "bank" in text_lower) or "30 minutes" in text_lower:
        result = {
            "riskLevel": "high_risk",
            "confidence": 0.89,
            "summary": "Urgent account suspension threat with suspicious unverified link.",
            "signals": [
                "Artificial urgency ('blocked within 30 minutes') designed to cause panic",
                "Third-party domain link instead of official bank portal",
                "Unsolicited request to complete sensitive identity verification (KYC)"
            ],
            "whyItMatters": "Financial institutions never send high-pressure SMS threats with non-official website links requiring instant action.",
            "potentialImpact": "Clicking the link may expose online banking credentials, identity details, and financial account access to attackers.",
            "recommendedAction": "Do not click the link or log in through the link provided in the message.",
            "verificationAdvice": "Open your bank's official mobile app independently or call the customer service phone number printed on the back of your debit/credit card.",
            "evidence": [
                {"category": "urgency", "title": "Extreme Time Pressure", "detail": "Demands action within 30 minutes to prevent account lock."},
                {"category": "threat_vector", "title": "Phishing Domain Vector", "detail": "Unverified external domain masquerading as a banking portal."},
                {"category": "financial", "title": "Credential Harvesting Signal", "detail": "Directs user to input sensitive KYC and login details."}
            ]
        }
    # Check Demo 2: Prize Win / Fee Scam
    elif "congratulations" in text_lower or "won" in text_lower or "25,000" in text_lower or "25000" in text_lower or "processing fee" in text_lower or "upi" in text_lower:
        result = {
            "riskLevel": "potentially_dangerous",
            "confidence": 0.86,
            "summary": "Advance-fee lottery/prize claim scheme detected.",
            "signals": [
                "Unsolicited announcement of a large monetary prize (₹25,000)",
                "Requirement to pay an advance 'processing fee' (₹499) to release funds",
                "Direct payment requested via personal UPI/digital wallet"
            ],
            "whyItMatters": "Legitimate lotteries and contests never require winner payment of advance fees or UPI transfers to claim prizes.",
            "potentialImpact": "Direct loss of requested processing fee (₹499) with no prize payout, plus exposure of payment wallet details.",
            "recommendedAction": "Refuse the payment request and block the sender immediately.",
            "verificationAdvice": "Verify if you ever officially entered such a contest. Legitimate organizations deduct taxes or fees at source rather than asking for upfront payment.",
            "evidence": [
                {"category": "financial", "title": "Advance-Fee Scam Vector", "detail": "Promises reward upon payment of an upfront fee."},
                {"category": "linguistic_pattern", "title": "Unsolicited Reward Bait", "detail": "Claims user won a lottery without prior entry."}
            ]
        }
    # Check Demo 3: Voice / OTP Vishing Scam
    elif "otp" in text_lower or "one-time password" in text_lower or ("calling from" in text_lower and "bank" in text_lower) or "unauthorized login" in text_lower:
        result = {
            "riskLevel": "high_risk",
            "confidence": 0.94,
            "summary": "Voice vishing attempt impersonating bank security to extract OTP.",
            "signals": [
                "Caller impersonates official bank security personnel over phone call",
                "Direct verbal request to share 6-digit One-Time Password (OTP)",
                "Manufactured crisis regarding an alleged 'unauthorized login attempt'"
            ],
            "whyItMatters": "Bank employees are strictly prohibited from asking customers for OTPs, PINs, or password details over the phone.",
            "potentialImpact": "Sharing an OTP authorizes immediate fraudulent fund transfers or device registration on your bank account.",
            "recommendedAction": "Disconnect the call immediately and do not share any numbers or codes.",
            "verificationAdvice": "Hang up and manually dial your bank's official customer care helpline number from their official website or debit card.",
            "evidence": [
                {"category": "threat_vector", "title": "Voice Social Engineering (Vishing)", "detail": "Caller creates urgency to bypass security protocols."},
                {"category": "financial", "title": "OTP Extraction Signal", "detail": "Direct request for temporary authentication token."}
            ]
        }
    else:
        result = {
            "riskLevel": "low_risk",
            "confidence": 0.78,
            "summary": "No high-risk threat vectors or scam indicators detected.",
            "signals": [
                "No urgent payment or OTP requests found",
                "Standard communication structure without known phishing patterns"
            ],
            "whyItMatters": "The input does not display typical indicators of active financial fraud or credential phishing.",
            "potentialImpact": "Low probability of immediate risk.",
            "recommendedAction": "Maintain normal digital safety practices when interacting with external messages.",
            "verificationAdvice": "Always confirm sender identity if requested to perform sensitive operations.",
            "evidence": [
                {"category": "metadata", "title": "Standard Input", "detail": "Passed initial security screening rules."}
            ]
        }

    analysis_id = f"analysis-{int(time.time()*1000)}"
    result["id"] = analysis_id
    result["modality"] = modality
    result["createdAt"] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    result["rawInputSnippet"] = raw_text[:300]
    result["summary"] = sanitize_safety_text(result["summary"])
    result["whyItMatters"] = sanitize_safety_text(result["whyItMatters"])
    result["potentialImpact"] = sanitize_safety_text(result["potentialImpact"])
    result["recommendedAction"] = sanitize_safety_text(result["recommendedAction"])
    result["verificationAdvice"] = sanitize_safety_text(result["verificationAdvice"])

    save_analysis_to_db(result, raw_text)
    return result

def save_analysis_to_db(result, raw_input):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO analyses (id, modality, input_summary, raw_input, risk_level, confidence, summary, why_it_matters, potential_impact, recommended_action, verification_advice, result_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        result["id"], result["modality"], raw_input[:100], raw_input,
        result["riskLevel"], result["confidence"], result["summary"],
        result["whyItMatters"], result["potentialImpact"], result["recommendedAction"],
        result["verificationAdvice"], json.dumps(result), result["createdAt"]
    ))
    for ev in result.get("evidence", []):
        cursor.execute('''
            INSERT INTO analysis_evidence (analysis_id, category, title, detail) VALUES (?, ?, ?, ?)
        ''', (result["id"], ev.get("category", "threat_vector"), ev["title"], ev["detail"]))
    conn.commit()
    conn.close()

def get_all_analyses():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT result_json FROM analyses ORDER BY created_at DESC LIMIT 50')
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(r[0]) for r in rows]

def save_feedback(analysis_id, is_helpful, comments=''):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    fb_id = f"fb-{int(time.time()*1000)}"
    cursor.execute('INSERT INTO feedback (id, analysis_id, is_helpful, comments) VALUES (?, ?, ?, ?)',
                   (fb_id, analysis_id, 1 if is_helpful else 0, comments))
    conn.commit()
    conn.close()
    return {"id": fb_id}

# HTML UI Template matching Stitch Design System exactly
HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>TrustVision - Multimodal AI Safety Layer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-navy: #0b1326;
      --surface-container: #171f33;
      --surface-high: #222a3d;
      --color-primary: #2563eb;
      --color-primary-hover: #1d4ed8;
      --color-primary-light: #b4c5ff;
      --text-on-surface: #dae2fd;
      --text-muted: #c3c6d7;
      --color-outline: #434655;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background-color: #030712;
      color: var(--text-on-surface);
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh;
    }
    .app-container {
      width: 100%; max-width: 480px; height: 100vh; max-height: 940px;
      background-color: var(--bg-navy); display: flex; flex-direction: column;
      position: relative; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
    }
    @media (min-width: 520px) {
      .app-container { border-radius: 36px; border: 8px solid #1e293b; height: 90vh; }
    }
    .app-header {
      height: 64px; padding: 0 16px; background-color: #131b2e;
      border-bottom: 1px solid var(--color-outline);
      display: flex; align-items: center; justify-content: space-between;
    }
    .brand { font-weight: 700; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 8px; }
    .status-badge {
      display: flex; align-items: center; gap: 6px; padding: 4px 10px;
      border-radius: 999px; background: rgba(37, 99, 235, 0.15); border: 1px solid rgba(37, 99, 235, 0.3);
      font-size: 12px; color: var(--color-primary-light);
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e; }
    .app-main { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; padding-bottom: 80px; }
    .card { background-color: var(--surface-container); border: 1px solid var(--color-outline); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .card-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .preset-chip { background-color: #131b2e; border: 1px solid var(--color-outline); border-radius: 12px; padding: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; text-align: left; width: 100%; color: inherit; }
    .preset-chip:hover { border-color: var(--color-primary); background-color: var(--surface-high); }
    .preset-title { font-size: 14px; font-weight: 600; color: #fff; }
    .preset-sub { font-size: 12px; color: var(--text-muted); }
    .tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .tag.text { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .tag.image { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
    .tag.voice { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
    .tab-switcher { display: flex; background: #060e20; padding: 4px; border-radius: 12px; border: 1px solid var(--color-outline); }
    .tab-btn { flex: 1; height: 38px; background: none; border: none; color: var(--text-muted); font-weight: 600; font-size: 13px; border-radius: 8px; cursor: pointer; }
    .tab-btn.active { background: var(--color-primary); color: #fff; }
    textarea { width: 100%; min-height: 100px; background: #060e20; border: 1px solid var(--color-outline); border-radius: 8px; padding: 10px; color: #fff; font-family: inherit; font-size: 14px; outline: none; }
    textarea:focus { border-color: var(--color-primary); }
    .btn-primary { height: 48px; background: var(--color-primary); color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; }
    .btn-primary:hover { background: var(--color-primary-hover); }
    .risk-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .risk-pill.high_risk, .risk-pill.potentially_dangerous { background: rgba(188,72,0,0.25); border: 1px solid #ffb596; color: #ffb596; }
    .risk-pill.low_risk, .risk-pill.safe { background: rgba(27,94,32,0.25); border: 1px solid #81c784; color: #81c784; }
    .modal { position: absolute; inset: 0; background: rgba(11,19,38,0.96); backdrop-filter: blur(8px); z-index: 50; display: none; flex-direction: column; overflow-y: auto; padding: 16px; gap: 16px; }
    .modal.open { display: flex; }
    .nav-bar { position: absolute; bottom: 0; inset-x: 0; height: 64px; background: #131b2e; border-top: 1px solid var(--color-outline); display: flex; justify-content: space-around; align-items: center; }
    .nav-item { background: none; border: none; color: var(--text-muted); font-size: 11px; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .nav-item.active { color: var(--color-primary-light); }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>TrustVision</span>
      </div>
      <div class="status-badge"><div class="status-dot"></div><span>AI Safety Active</span></div>
    </header>

    <main class="app-main" id="mainView">
      <!-- Quick Demo Scenarios -->
      <div class="card">
        <div class="card-title">✨ Quick Demo Scenarios</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="preset-chip" onclick="fillPreset('text')">
            <div>
              <div class="preset-title">Urgent Bank Block SMS</div>
              <div class="preset-sub">Urgent KYC threat requiring instant link click</div>
            </div>
            <span class="tag text">TEXT</span>
          </button>
          <button class="preset-chip" onclick="fillPreset('image')">
            <div>
              <div class="preset-title">Lottery ₹25,000 Win Banner</div>
              <div class="preset-sub">Screenshot claiming win requiring advance processing fee</div>
            </div>
            <span class="tag image">IMAGE</span>
          </button>
          <button class="preset-chip" onclick="fillPreset('voice')">
            <div>
              <div class="preset-title">Fake Bank Agent Call (OTP Request)</div>
              <div class="preset-sub">Impersonation asking for one-time password over call</div>
            </div>
            <span class="tag voice">VOICE</span>
          </button>
        </div>
      </div>

      <!-- Scanner Input Box -->
      <div class="card">
        <div class="tab-switcher">
          <button class="tab-btn active" id="tabText" onclick="switchTab('text')">Text</button>
          <button class="tab-btn" id="tabImage" onclick="switchTab('image')">Camera / Image</button>
          <button class="tab-btn" id="tabVoice" onclick="switchTab('voice')">Voice Note</button>
        </div>

        <div id="inputBox">
          <textarea id="scanInput" placeholder="Paste suspicious SMS, link, or message here..."></textarea>
        </div>

        <button class="btn-primary" onclick="runAnalysis()">
          <span>Scan & Analyze Input</span>
        </button>
      </div>

      <!-- Recent Scans History -->
      <div class="card">
        <div class="card-title">📜 Recent Safety Scans</div>
        <div id="historyContainer" style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:12px; color:var(--text-muted);">No scans run yet. Try a demo scenario above!</span>
        </div>
      </div>
    </main>

    <!-- Modal Analysis Report -->
    <div class="modal" id="resultModal">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div id="modalRiskPill" class="risk-pill high_risk">DANGEROUS</div>
        <button onclick="closeModal()" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">✕</button>
      </div>

      <div class="card" style="background:var(--surface-high);">
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--color-primary-light);">
          <span>SAFETY ASSESSMENT</span>
          <span id="modalConfidence">89% Confidence</span>
        </div>
        <div id="modalSummary" style="font-size:15px; font-weight:700; color:#fff;">Summary here</div>
        <span style="font-size:11px; color:var(--text-muted);">ℹ Note: TrustVision outputs probabilistic security estimates and never claims 100% certainty.</span>
      </div>

      <div class="card">
        <div class="card-title">⚠ What We Noticed</div>
        <ul id="modalSignals" style="font-size:13px; color:var(--text-on-surface); padding-left:16px;"></ul>
      </div>

      <div class="card">
        <div class="card-title">🔒 Why It Matters</div>
        <p id="modalWhy" style="font-size:13px; color:var(--text-muted);"></p>
      </div>

      <div class="card" style="border-left:4px solid #ffb596;">
        <div class="card-title" style="color:#ffb596;">Potential Consequence</div>
        <p id="modalImpact" style="font-size:13px; color:var(--text-on-surface);"></p>
      </div>

      <div class="card" style="border-color:var(--color-primary); background:rgba(37,99,235,0.1);">
        <div class="card-title" style="color:#fff;">✓ Recommended Safe Action</div>
        <p id="modalAction" style="font-size:14px; font-weight:600; color:#fff;"></p>
      </div>

      <div class="card">
        <div class="card-title">🛡 Safe Verification Advice</div>
        <p id="modalVerification" style="font-size:13px; color:var(--text-muted);"></p>
      </div>

      <button class="btn-primary" onclick="closeModal()">Close Report</button>
    </div>

    <nav class="nav-bar">
      <button class="nav-item active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Safety Scan</span>
      </button>
    </nav>
  </div>

  <script>
    let currentModality = 'text';
    const presets = {
      text: "Your bank account will be blocked within 30 minutes. Complete KYC using this link immediately: http://bank-kyc-verify-update.com/login",
      image: "Congratulations! You won ₹25,000. Pay ₹499 processing fee to claim your prize immediately via UPI ID: prize-claim@upi",
      voice: "I'm calling from your bank. Tell me the OTP you just received to verify your account right now."
    };

    function switchTab(mod) {
      currentModality = mod;
      ['text', 'image', 'voice'].forEach(m => {
        document.getElementById('tab' + m.charAt(0).toUpperCase() + m.slice(1)).classList.toggle('active', m === mod);
      });
      if (!document.getElementById('scanInput').value) {
        fillPreset(mod);
      }
    }

    function fillPreset(mod) {
      switchTab(mod);
      document.getElementById('scanInput').value = presets[mod];
    }

    async function runAnalysis() {
      const inputVal = document.getElementById('scanInput').value;
      if (!inputVal) return alert('Please enter text or select a preset.');

      const endpoint = '/api/analyze/' + currentModality;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ text: inputVal })
        });
        const data = await res.json();
        showModal(data);
        fetchHistory();
      } catch(err) {
        alert('Analysis error: ' + err.message);
      }
    }

    function showModal(data) {
      document.getElementById('modalRiskPill').innerText = data.riskLevel.replace('_', ' ').toUpperCase();
      document.getElementById('modalRiskPill').className = 'risk-pill ' + data.riskLevel;
      document.getElementById('modalConfidence').innerText = Math.round(data.confidence * 100) + '% Confidence';
      document.getElementById('modalSummary').innerText = data.summary;
      
      const signalsList = document.getElementById('modalSignals');
      signalsList.innerHTML = '';
      (data.signals || []).forEach(s => {
        const li = document.createElement('li'); li.innerText = s; signalsList.appendChild(li);
      });

      document.getElementById('modalWhy').innerText = data.whyItMatters;
      document.getElementById('modalImpact').innerText = data.potentialImpact;
      document.getElementById('modalAction').innerText = data.recommendedAction;
      document.getElementById('modalVerification').innerText = data.verificationAdvice;

      document.getElementById('resultModal').classList.add('open');
    }

    function closeModal() {
      document.getElementById('resultModal').classList.remove('open');
    }

    async function fetchHistory() {
      try {
        const res = await fetch('/api/analyses');
        const data = await res.json();
        const container = document.getElementById('historyContainer');
        if (data.length === 0) return;
        container.innerHTML = '';
        data.slice(0, 5).forEach(item => {
          const div = document.createElement('div');
          div.style.cssText = 'padding:10px; background:#131b2e; border-radius:8px; font-size:12px; cursor:pointer; border:1px solid #434655;';
          div.onclick = () => showModal(item);
          div.innerHTML = `<strong>${item.modality.toUpperCase()}</strong>: ${item.summary.substring(0, 45)}...`;
          container.appendChild(div);
        });
      } catch(e){}
    }

    // Default fill text preset on load
    fillPreset('text');
    fetchHistory();
  </script>
</body>
</html>
"""

class RequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _send_html(self, html, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/' or path == '/index.html':
            self._send_html(HTML_PAGE)
            return

        if path == '/api/analyses':
            analyses = get_all_analyses()
            self._send_json(analyses)
            return

        if path.startswith('/api/analyses/'):
            analysis_id = path.replace('/api/analyses/', '')
            analyses = get_all_analyses()
            match = next((a for a in analyses if a['id'] == analysis_id), None)
            if match:
                self._send_json(match)
            else:
                self._send_json({"error": "Analysis not found"}, 404)
            return

        self._send_html(HTML_PAGE)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(content_length)

        try:
            body = json.loads(body_bytes.decode('utf-8')) if body_bytes else {}
        except Exception:
            body = {}

        raw_text = body.get('text', '') or body.get('rawInput', '') or 'Sample input content'

        if path == '/api/analyze/text':
            res = run_threat_engine(raw_text, 'text')
            self._send_json(res)
            return

        if path == '/api/analyze/image':
            res = run_threat_engine(raw_text, 'image')
            self._send_json(res)
            return

        if path == '/api/analyze/voice':
            res = run_threat_engine(raw_text, 'voice')
            self._send_json(res)
            return

        if path == '/api/feedback':
            analysis_id = body.get('analysisId', '')
            is_helpful = body.get('isHelpful', True)
            comments = body.get('comments', '')
            fb = save_feedback(analysis_id, is_helpful, comments)
            self._send_json({"success": True, **fb}, 201)
            return

        self._send_json({"error": "Endpoint not found"}, 404)

if __name__ == '__main__':
    init_db()
    print(f"[TrustVision] Server running on http://localhost:{PORT}")
    server = HTTPServer(('0.0.0.0', PORT), RequestHandler)
    server.serve_forever()
