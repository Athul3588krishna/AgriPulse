# 🌱 AgriPulse (AgriMitra 360)

> **An End-to-End Multimodal Smart Agriculture Platform powered by Autonomous Agentic AI, Computer Vision, and Real-Time Market Intelligence.**

---

## 📌 Overview

**AgriPulse (AgriMitra 360)** is designed to empower smallholder farmers by solving the key challenges of modern agriculture: delayed disease diagnosis, middleman market exploitation, and lack of awareness about government subsidies. 

The platform provides a **voice-first, bilingual (Malayalam & English)** experience that allows farmers to interact naturally without technical or language barriers.

---

## 🚀 Key Features

### 1. 🤖 Autonomous Agentic AI Voice Assistant
- Powered by an autonomous **ReAct (Reason + Act)** decision engine.
- Dynamically selects and runs tools to answer complex, compound farming questions.
- Bilingual speech-to-speech (STT & TTS) in native **Malayalam** and **English**.
- Displays step-by-step reasoning traces and tool badges (`⚡ Mandi Rates`, `🌧️ Spray Safety`, `🔬 KAU Advisory`, `🏛️ PMFBY Subsidy`).

### 2. 🌿 Crop Disease Diagnosis & Leaf Scanner
- **Deep Learning**: PyTorch MobileNet model detects crop diseases from leaf photographs.
- **OpenCV Lesion Severity Analysis**: Quantifies damaged leaf area percentage using HSV segmentation.
- **KAU / ICAR RAG Advisory**: Provides certified organic (Neem, *Trichoderma*) and chemical treatment dosages.

### 3. 📈 Mandi Market Intelligence & Middleman Arbitrage
- Real-time **APMC Mandi rates** across Kerala districts (Palakkad, Ernakulam, Thrissur, Wayanad, etc.).
- **7-Day Price Forecast**: Trend projections to decide whether to sell immediately or hold in storage.
- **Middleman Arbitrage Calculator**: Shows exact extra profit gained by selling directly to APMC markets.

### 4. 🏛️ Subsidy & PMFBY Crop Insurance Navigator
- Instant eligibility checks for **PMFBY**, **PM-KISAN**, **Subhiksha Keralam**, and Micro-Irrigation schemes.
- Generates official claim application packets with digital damage severity proof.

### 5. 🌦️ Weather & Spray Safety Radar
- Live meteorological data from Open-Meteo (temperature, humidity, precipitation probability, wind speed).
- Real-time safety indicator: **SAFE**, **CAUTION**, or **UNSAFE** for pesticide/fertilizer spraying.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Web Speech API |
| **Backend Gateway** | Node.js, Express.js, MongoDB / Mongoose, JWT, Axios, Multer |
| **AI Microservice** | Python 3.10+, FastAPI, PyTorch, Torchvision, OpenCV, Pillow |
| **External APIs** | Open-Meteo (Keyless Weather), Agmarknet / APMC Data |

---

## 📂 Project Structure

```
AgriPulse/
├── client/                 # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/     # UI Components (VoiceAgentModal, Navbar, Footer)
│   │   ├── context/        # Auth & Language Context (Malayalam / English)
│   │   ├── pages/          # Pages (Scan, Mandi, Subsidies, Plots, Dashboard)
│   │   └── App.jsx         # App router & layout
├── server/                 # Express API Gateway
│   ├── routes/             # API routes (agent, mandi, weather, subsidies, auth)
│   ├── services/           # Agentic AI ReAct engine & tools (agentService.js)
│   ├── models/             # Mongoose schemas (User, Plot, Diagnosis)
│   └── server.js           # Server entry point
├── ai_service/             # Python Computer Vision & RAG Microservice
│   ├── disease_classifier.py # PyTorch leaf disease prediction
│   ├── severity_analyzer.py  # OpenCV HSV severity percentage
│   ├── rag_engine.py         # KAU/ICAR advisory knowledge retriever
│   ├── knowledge_data.json   # Scientific treatment guidelines
│   └── main.py               # FastAPI application
├── package.json            # Root configuration for concurrent execution
└── README.md               # Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.10 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)

---

### Step 1: Install Dependencies

```bash
# Install root, server, and client dependencies
npm install
cd server && npm install
cd ../client && npm install
```

For the Python AI service:
```bash
cd ai_service
pip install -r requirements.txt
```

---

### Step 2: Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agripulse
JWT_SECRET=agripulse_secret_key_prod_2026
AI_SERVICE_URL=http://127.0.0.1:8000
# Optional: GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Step 3: Run the Application

#### Option A: Run Everything Concurrently (Root)
```bash
npm run dev
```

#### Option B: Run Services in Separate Terminals

**Terminal 1 — Node.js Server:**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — React Client:**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

**Terminal 3 — Python AI Service:**
```bash
cd ai_service
uvicorn main:app --port 8000 --reload
# Running on http://localhost:8000
```

---

## 🧠 How Agentic AI Works in AgriPulse

```
                      +-----------------------------+
                      | Farmer Query (Voice / Text) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Autonomous ReAct Agent    |
                      |     (agentService.js)       |
                      +--------------+--------------+
                                     |
                +--------------------+--------------------+
                |                    |                    |
                v                    v                    v
       [ tool_mandi_prices ] [ tool_weather_spray ] [ tool_disease_adv ]
       [ tool_subsidy_nav  ] [ tool_arbitrage_calc]
                |                    |                    |
                +--------------------+--------------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Bilingual Final Answer    |
                      |  (Malayalam & English TTS)  |
                      |   + Reasoning Step Traces   |
                      +-----------------------------+
```

1. **Reason (`Thought`)**: Analyzes farmer intent, crop name, district, and required information.
2. **Act (`Tool Calling`)**: Calls relevant specialized tools asynchronously.
3. **Observe (`Observation`)**: Collects validated data from APMC feeds, Open-Meteo, and scientific advisories.
4. **Synthesize (`Final Answer`)**: Combines results into a clear, spoken response in Malayalam or English with transparency badges.

---

## 🌐 Application Pages & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | **Home** | Overview of platform features and quick access |
| `/scan` | **Leaf Scanner** | Upload crop leaf photos for disease detection & OpenCV damage % |
| `/mandi` | **Mandi Intelligence** | APMC market prices, 7-day forecast & middleman arbitrage calculator |
| `/subsidies` | **Subsidy Navigator** | PMFBY insurance claim filing & government scheme matching |
| `/dashboard` | **Farmer Dashboard** | Farm plots, diagnosis history, and weather widgets |
| `/plots` | **My Farm Plots** | Manage land holdings and crop records |
| `/history` | **Scan History** | Historical records of past leaf scans |
| *Floating* | **Voice AI Agent** | Zero-touch speech assistant available across all pages |

---

## 📜 License & Credits
Developed for agricultural research and smart farming innovation.  
Data and scientific practices referenced from:
- **Kerala Agricultural University (KAU)**
- **Indian Council of Agricultural Research (ICAR)**
- **Agmarknet (Ministry of Agriculture & Farmers Welfare, GoI)**
- **Open-Meteo Weather API**
