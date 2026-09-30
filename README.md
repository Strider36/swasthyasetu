# 🩺 Sanjeev Astra

> **AI-Powered Healthcare Navigation for Everyone**  
> *Right Care. Right Place. Right Time.*

---

## 📌 Project Overview

**Sanjeev Astra** is an AI-powered healthcare navigation platform that helps patients describe their health problems, understand the appropriate level of care, discover nearby healthcare facilities, and access emergency assistance when required.

### 🔄 Core Concept & Workflow

```
Patient Problem ➔ AI Understanding ➔ Care Guidance ➔ Nearby Facility ➔ Treatment/Consultation ➔ Referral ➔ Follow-up
```

> **Important Safety Note**: Sanjeev Astra AI is a **healthcare navigation assistant**, not a replacement for professional medical doctors. It provides preliminary guidance, triage categorization, and local healthcare discovery to empower patient decision-making.

---

## ✨ Key Features

### 1. 🩺 Sanjeev Astra AI Healthcare Navigation
* **Symptom & Problem Input**: Express symptoms via typed text or native voice recording (Web Speech API).
* **Intelligent Care Level Triage**: AI categorizes user needs into:
  * 🟢 **Home Care & Observation** (rest, fluids, monitoring)
  * 🟡 **Primary Care / General Physician** (PHC, local clinic, family doctor)
  * 🟠 **Specialist Consultation** (Cardiology, Orthopedics, Neurology, etc.)
  * 🔴 **Emergency / Medical SOS** (immediate hospital dispatch required)
* **Instant Facility Recommendation**: Suggests the closest verified medical facilities with real-time distance calculations and contact numbers.
* **Seamless Action Shortcuts**: Direct shortcuts to book consultations or trigger Emergency SOS.

### 2. 🌐 Multilingual Regional Support
* **Supported Languages**:
  * 🇬🇧 **English**
  * 🇮🇳 **हिंदी (Hindi)**
  * 🇮🇳 **मराठी (Marathi)**
* **Zero Page-Reload Switching**: Instant dynamic DOM text translation using data-i18n attributes and JSON localization dictionaries (`public/locales/`).
* **Low-Literacy Accessible UI**: Iconography, visual badges, and synthesized audio voice guidance in Hindi, Marathi, and English.
* **Extensible Architecture**: Add any regional Indian language by simply dropping a new `<lang>.json` file in the locales directory.

### 3. 🚨 Medical SOS Emergency Response System
* **4 Rapid Emergency Channels**:
  1. 🚑 **Request Ambulance**: Immediate dispatch of nearby life-support ambulance (`MH 12 QX 4521`).
  2. 🏥 **Nearest Hospital**: Direct routing and coordinates to emergency trauma centers.
  3. 🩺 **Need Medical Help**: Connect with registered on-duty community health workers.
  4. 📞 **Emergency Contacts**: One-tap calling to National Emergency (112), Ambulance (108), Police (100).
* **GPS Geolocation**: High-accuracy HTML5 geolocation capture with fallback to default district coordinates.
* **Interactive Live Map**: Real-time Leaflet & OpenStreetMap tracking displaying patient location, ambulance route, and hospital destinations.
* **Offline Resilience**: Offline emergency queuing in `localStorage` with automatic background synchronization upon network reconnection.
* **Health Worker & Admin Dispatch Board**: Dedicated dashboard (`/sos-admin.html`) with Role-Based Access Control (RBAC) to triage, assign ambulances, and update live incident statuses.

### 4. 🗄️ Personal Health Vault
* **Doctor Consultations**: Schedule, track, and receive browser audio notifications for upcoming visits.
* **Medications & Dosages**: Daily medication schedules with intake alarms and adherence tracking.
* **OCR Prescription Scanner**: AI/OCR powered digital scanning of physical paper prescriptions.
* **Medical Profile & Records**: Chronic condition tracking, blood group, emergency contacts, and laboratory report archiving.

---

## 🛠️ Technology Stack

* **Backend**: Node.js, Express.js (v5), MongoDB, Mongoose, JWT (JSON Web Tokens), bcryptjs
* **Frontend**: HTML5, Vanilla JavaScript (ES6+ Modules), Vanilla CSS (Custom Design System, Glassmorphism, Responsive Grid)
* **GIS & Maps**: Leaflet.js, OpenStreetMap
* **Speech Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **Icons & UI**: Lucide Icons

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) running locally on `localhost:27017` (or remote MongoDB URI via `.env`)

### Installation & Setup

1. **Clone or open the workspace**:
   ```bash
   cd d:\SS2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Access the application**:
   * Open your browser and navigate to: [http://localhost:5000](http://localhost:5000)
   * Patient Dashboard: [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
   * Emergency Dispatch Board: [http://localhost:5000/sos-admin.html](http://localhost:5000/sos-admin.html)

---

## 🛡️ License

Built with care for public health and community emergency response.
