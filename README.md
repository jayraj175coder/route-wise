# RouteWise
### Risk-Aware Personal Mobility Decision Engine

> **“Don't just find a route. Find the journey most likely to get you there on time.”**

---

## 🚀 The Core Problem

Traditional route planners (Google Maps, Citymapper, Transit) optimize for **distance, static travel time, or price**. However, real-world travellers with critical deadlines (job interviews, university exams, flights, emergency meetings) face uncertainty:

- **Tight Transfers:** A 6-minute connection across complex train platforms often fails.
- **Highway Fragility:** A single accident on a major expressway can turn a 3-hour trip into a 5-hour gridlock.
- **Zero Safety Buffer:** Google Maps claims you'll arrive at 9:58 AM for a 10:00 AM interview, leaving zero margin for error.
- **Ignored Constraints:** Travellers carry hard mobility constraints (maximum walking limits, strict budget ceilings, maximum transfers).

**RouteWise solves this problem:**
> RouteWise evaluates multiple transportation options under real-world constraints and uncertainty, then recommends the journey with the best personalized trade-off between time, cost, walking, transfers, reliability, arrival buffer, and disruption risk.

---

## 💡 The Core Innovation

RouteWise is **NOT** a generic AI travel planner and **NOT** a Google Maps clone.

1. **Deterministic Optimization Engine (`/backend/app/engine/`)**: Final rankings and scoring come from a transparent multi-objective mathematical engine—not LLM hallucinations.
2. **Proprietary RouteWise Confidence Score (0–100)**: An internal decision score combining arrival buffer, number of transfers, transfer tightness, multimodal complexity, and live disruption signals.
3. **Hard Constraint Filtering**: Eliminates candidate journeys violating budget, deadline, walking, or transfer limits before ranking. If no route satisfies all constraints, RouteWise highlights the closest alternative and explicitly specifies which constraint to relax.
4. **Live Disruption Intelligence powered by SerpApi**: Continuously queries Google News and Google Search for active road closures, accident reports, and transit delays.
5. **Dynamic Re-optimization ("Something changed")**: When conditions change, RouteWise dynamically reroutes and explains why the ranking shifted in grounded numerical terms.
6. **Interactive What-If Simulator**: Live parameter sliders for budget, walking limits, and priority weights update rankings in real time.

---

## 🛡️ Hero Differentiator: RouteWise Confidence Score

Example:
```
92 / 100
RouteWise Confidence
```
The score combines:
- **Arrival Safety Buffer** (e.g. +42 min buffer)
- **Transfer Count & Complexity** (e.g. direct vs 2 transfers)
- **Transfer Tightness** (connection margin between segments)
- **Corridor Reliability** (dedicated rail right-of-way vs highway traffic)
- **Active Disruption Penalties** (news & traffic incident signals)
- **User Intent Sensitivity** (Interview, Exam, Flight, Emergency, Family, Budget, General)

> *Notice:* “RouteWise Confidence is an internal decision score based on available route and disruption signals. It is not a guaranteed probability of arrival.”

---

## 🏗️ Architecture & Project Structure

```
routewise/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint
│   │   ├── api/
│   │   │   ├── endpoints.py            # REST endpoints (optimize, reoptimize, what-if, demo)
│   │   │   └── schemas.py              # Pydantic request/response schemas
│   │   ├── engine/                     # Core Deterministic Optimization Engine
│   │   │   ├── constraints.py          # Hard constraint filtering
│   │   │   ├── normalization.py        # 0–100 sub-score normalization
│   │   │   ├── risk.py                 # Risk analysis & factor evaluation
│   │   │   ├── scoring.py              # Multi-objective 7-parameter weighted scoring
│   │   │   ├── optimizer.py            # Pareto candidate ranking pipeline
│   │   │   └── explanations.py         # Grounded numerical explanation generator
│   │   ├── services/
│   │   │   ├── serpapi/                # Dedicated SerpApi integration layer
│   │   │   │   ├── client.py           # SerpApi client wrapper
│   │   │   │   ├── disruptions.py      # Google News & Search disruption signals
│   │   │   │   └── normalizer.py       # Directions response normalizer
│   │   │   └── demo_data.py            # Deterministic hackathon demo scenario generator
│   │   └── models/
│   │       └── domain.py               # Route, Segment, Disruption & Intent domain models
│   ├── tests/                          # Comprehensive pytest test suite (15 unit tests)
│   ├── requirements.txt
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Brand header & 3-Min demo launcher
│   │   │   ├── HeroSearch.tsx          # Origin/Destination, constraints & intent form
│   │   │   ├── IntentSelector.tsx      # Purpose presets (Interview, Exam, Flight, etc.)
│   │   │   ├── WeightSliders.tsx       # Advanced priority sliders
│   │   │   ├── BestJourneyCard.tsx     # Hero recommendation card & Confidence gauge
│   │   │   ├── ScoreBreakdown.tsx      # Why this route checklist & sub-scores
│   │   │   ├── AlternativesList.tsx    # Cheapest, Fastest, Most Reliable comparison
│   │   │   ├── InteractiveMap.tsx      # Leaflet map with mode-based corridor styling
│   │   │   ├── EvidenceModal.tsx       # Live SerpApi disruption intelligence evidence
│   │   │   ├── ReoptimizeBanner.tsx    # "Something changed" dynamic rerouting view
│   │   │   ├── WhatIfSimulator.tsx     # Real-time parameter stress-testing sliders
│   │   │   ├── DemoSequenceController.tsx # 3-Minute judge presentation controller
│   │   │   └── DisclaimerFooter.tsx    # Mandatory safety & positioning footer
│   │   ├── services/
│   │   │   └── api.ts                  # Backend API proxy with local fallback
│   │   ├── types/
│   │   │   └── journey.ts              # TypeScript interfaces
│   │   ├── App.tsx                     # Core dashboard assembly
│   │   ├── index.css                   # Tailwind, custom fonts, glassmorphism
│   │   └── main.tsx                    # React application root
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## 🧮 Multi-Objective Scoring Formula

RouteWise computes normalized sub-scores ($0 - 100$):
$$\text{time\_score}, \text{cost\_score}, \text{walking\_score}, \text{transfer\_score}, \text{buffer\_score}, \text{reliability\_score}, \text{risk\_score}$$

The composite ranking score is calculated as:
$$\text{overall\_score} = w_{\text{time}} \cdot \text{time} + w_{\text{cost}} \cdot \text{cost} + w_{\text{walking}} \cdot \text{walk} + w_{\text{transfer}} \cdot \text{transfer} + w_{\text{buffer}} \cdot \text{buffer} + w_{\text{reliability}} \cdot \text{reliability} - (w_{\text{risk}} \cdot \text{risk\_penalty})$$

### Journey Intent Presets
- **Interview:** High reliability (0.28), large buffer (0.26), low risk penalty (0.15), moderate cost.
- **Exam:** Maximum buffer (0.30), maximum reliability (0.30), low walking (0.10).
- **Flight:** Generous lead time (0.30), zero transfer vulnerability (0.16).
- **Emergency:** Maximum time priority (0.65).
- **Family:** Low walking (0.25), low transfers (0.25), comfort (0.20).
- **Budget:** Cost dominant (0.60), time (0.10).
- **General:** Balanced distribution.

---

## 🌐 SerpApi Integration Layer

RouteWise interfaces with SerpApi via `backend/app/services/serpapi/`:
- **Google Maps Directions API:** Ingests multimodal candidate routes (transit, driving, walking).
- **Google Search & Google News:** Queries live real-time keywords:
  - *"[Origin] [Destination] highway traffic disruption today"*
  - *"[Origin] [Destination] train delay disruption today"*
  - *"[Origin] road closure traffic delay"*
- **Evidence Verification:** Every disruption signal includes source name, publication time, direct URL, severity level, location, and confidence level.

---

## ⚡ 3-Minute Hackathon Demo Scenario

The application includes an integrated **3-Minute Demo Sequence Controller** designed specifically for judging presentations:

1. **Step 1: Mumbai → Pune Interview Scenario**  
   User enters origin (Dadar, Mumbai) and destination (Hinjawadi, Pune) with a 10:10 AM interview deadline, ₹1,500 budget, and Interview intent.
2. **Step 2: Multi-Objective Optimization**  
   Engine filters hard constraints and calculates RouteWise Confidence.
3. **Step 3: Grounded Explanation & Score Breakdown**  
   Engine explains in exact numerical values why the top route was selected over alternatives.
4. **Step 4: Live Expressway Disruption Alert**  
   Simulate sudden Khandala Ghat blockage on the expressway (+65 min delay exposure).
5. **Step 5: Dynamic Re-optimization ("Something changed")**  
   System re-evaluates routes: Expressway bus is rejected due to missed deadline, and RouteWise reroutes to Deccan Express Rail + Auto (+42 min safety buffer).
6. **Step 6: Interactive What-If Simulation**  
   Adjust budget and walking sliders to observe instantaneous candidate re-ranking.

---

## 🛠️ Setup & Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

# Run Unit Tests
pytest -v

# Start FastAPI Backend
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

*(Optional)* To use live SerpApi queries, set your API key in an `.env` file in `backend/`:
```env
SERPAPI_API_KEY=your_serpapi_key_here
```
*(If no key is provided, RouteWise automatically runs in high-fidelity deterministic Demo Mode).*

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite React Dev Server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Unit Tests

Run the complete backend test suite:
```bash
cd backend
pytest -v
```
Test cases cover:
- ✅ Budget constraint filtering
- ✅ Walking limit enforcement
- ✅ Maximum transfers enforcement
- ✅ Arrival deadline buffer constraint
- ✅ Intent preset weight calculations
- ✅ RouteWise Confidence score bounds & disclaimer
- ✅ Cheapest route wins in Budget mode
- ✅ Reliable route wins in Interview mode
- ✅ Risk factor detection & disruption penalties
- ✅ Re-optimization ranking shift under disruption
- ✅ What-If parameter recalculation
- ✅ API health, optimize, re-optimize, and what-if endpoints

---

## 🗺️ Future Roadmap

1. **Live GPS Telemetry Integration:** Continuous in-transit polling that triggers auto re-routing if the user misses a planned connection.
2. **Crowdsourced Commuter Signals:** Real-time crowd reports for platform congestion and auto-rickshaw queue wait times.
3. **Multi-City Commuter Profiles:** Pre-calibrated city models for Mumbai, Bengaluru, Delhi, London, and Tokyo.
4. **Offline PWA Support:** Cached offline fallback guidance for low-connectivity train transit corridors.

---

## 📄 License
MIT License. Built for hackathon demonstration.
