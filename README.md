# AETERNA DosePact

**AETERNA DosePact** is a precision medication adherence hub and gastrointestinal (GI) safety platform designed to ensure patient compliance, verify pill intake via computer vision, and prevent drug-induced stomach damage.

---

## 🌟 Overview & Key Features

### 1. Dedicated Patient Registration & Auth Page
- **Full-Screen Authentication Interface**: A standalone page for patient registration and sign-in.
- **GI Risk Profiling**: Captures specific stomach sensitivities (GERD, Gastritis, Peptic Ulcer Disease, NSAID Sensitivity) upon sign-up to tailor interaction safety rules.
- **Security & Age Guards**: Includes password strength scoring, date-of-birth verification (18+), and JWT session authorization.

### 2. Stomach & GI Interaction Safety Engine
- **Automated Risk Assessment**: Evaluates user medications against GI condition profiles.
- **Mucosal Damage Warnings**: Identifies high-risk NSAIDs, corticosteroids, and GI irritants, displaying meal-pairing guidance and mucosal protection alerts.

### 3. Vision Photo Dose Verification
- **Anti-Tamper Pill Logging**: Requires patients to capture a live photo of the medication in hand or palm before clearing scheduled reminders.
- **Verification Audit Logs**: Maintains time-stamped photo logs for clinical compliance and adherence verification.

### 4. Persistent Escalation Alarms & Custom Audio Manager
- **3-Tier Persistent Alarm Logic**: Escalate alarms if doses are missed beyond scheduled windows.
- **Custom Audio Track Manager**: Allows patients to upload custom MP3, WAV, OGG, or M4A audio files up to 10MB to customize their alarm chime.

### 5. Medication Cabinet & Analytics Dashboard
- **Schedule Builder**: Flexible daily and weekly scheduling with food-interaction rules (e.g., *Take after meals*, *Take with full glass of water*).
- **Adherence Analytics**: Visual tracking of dose compliance percentages, streak counters, and historical logs.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, `motion/react` (Framer Motion), `lucide-react`
- **Backend**: Node.js, Express server (`server.ts`), `multer` for audio uploads
- **AI Integration**: Google Gemini API (`@google/genai`) for intelligent drug safety analysis and interaction warnings
- **Storage & Auth**: Persistent data store engine with JWT authentication support

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ 
- **npm**: v9+

### Installation & Execution

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   MONGODB_URI="mongodb://localhost:27017/aeterna_dosepact"
   JWT_SECRET="your-jwt-secret-key-here"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

---

## 📄 License

Created for AETERNA DosePact Medication Adherence & GI Safety Platform.
