<div align="center">
  <img src="https://img.shields.io/badge/RailMind-Agentic%20OS-blue?style=for-the-badge&logo=train&logoColor=white" alt="RailMind Banner" />
  <h1>🚆 RailMind: Autonomous Railway Operating System</h1>
  <p><strong>A Multi-Agent ReAct System powered by Gemini, YOLOv8, and XGBoost to predict delays, ensure safety, and autonomously detect track defects.</strong></p>
  
  [![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)](https://fastapi.tiangolo.com)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
  [![PyTorch](https://img.shields.io/badge/PyTorch-YOLOv8-red.svg)](https://pytorch.org)
  [![Gemini](https://img.shields.io/badge/Google%20AI-Gemini%202.5-orange.svg)](https://ai.google.dev/)
</div>

<br/>

## 🌟 The Problem
The Indian Railways network is one of the largest in the world, handling millions of passengers daily. However, it is plagued by three major inefficiencies:
1. **Unpredictable Delays:** Relying on static schedules rather than real-time data.
2. **Manual Track Inspections:** Human laborers walking thousands of kilometers of track to find defects.
3. **Reactive Safety:** Responding to accidents *after* they happen rather than predicting risk zones.

## 🚀 The Solution: RailMind
RailMind replaces legacy, fragmented systems with a **single conversational AI orchestrator**. 
Instead of a simple chatbot, RailMind is a true **ReAct (Reasoning + Acting) Agent**. When a user asks a question, the Orchestrator dynamically routes the task to specialized Machine Learning agents, processes the data, and returns actionable insights in real-time.

---

## 🧠 System Architecture

Our backend relies on a Master Orchestrator and 4 Specialized ML Agents.

### 1. 🤖 The Orchestrator (Google Gemini 2.5)
The brain of the system. It parses natural language (e.g., *"Is train 12301 delayed, and are there track cracks near Delhi?"*) and automatically invokes the correct Python tools in the backend without human intervention.

### 2. 👁️ Anomaly Agent (Computer Vision)
A custom-trained **YOLOv8** Object Detection model. It analyzes drone/camera images of railway tracks to identify physical defects such as **cracks, loose fasteners, and broken sleepers** with high accuracy.

### 3. ⏱️ Delay Agent (Predictive ML)
Powered by an **XGBoost Classifier** trained on 1.5 million historical Indian Railway records. It predicts the probability of severe train delays based on weather, station congestion, and historical precedence.

### 4. 🛡️ Safety Agent (Risk Profiling)
Analyzes historical train accident data to generate live "Danger Scores" for specific trains and zones, factoring in seasonal risks (e.g., monsoon flooding) and infrastructure age.

### 5. 🛤️ Routing Agent (Graph Networks)
Uses **NetworkX** to map 8,000+ stations and 5,000+ routes as a computational graph. It instantly calculates the shortest paths and alternative detours if a primary route is blocked by an accident.

---

## 💻 Tech Stack
* **Frontend:** Next.js, React, TailwindCSS, TypeScript
* **Backend:** FastAPI, Python, Uvicorn, LocalTunnel
* **Machine Learning:** PyTorch, Ultralytics (YOLOv8), XGBoost, Scikit-Learn, Pandas, NetworkX
* **LLM Engine:** Google Gemini 2.5 Flash API

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Chaitanya1914/Rail-Mind.git
cd Rail-Mind
```

### 2. Backend Setup (AI & ML)
```bash
# Navigate to the backend folder
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install required heavy ML dependencies
pip install fastapi uvicorn pandas scikit-learn xgboost networkx ultralytics torch torchvision google-generativeai python-dotenv

# Set up your Environment Variables
echo "GEMINI_API_KEY=your_google_api_key_here" > .env

# Start the FastAPI Server
python main.py
```

### 3. Start the Secure Tunnel
To allow the frontend to communicate with your local ML backend:
```bash
npx localtunnel --port 8000 --subdomain railmind-hackathon
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔮 Future Work & Scalability
While this hackathon prototype runs locally, the production architecture is designed to be highly scalable:
- **IoT Integration:** Connecting the YOLOv8 Anomaly Agent to live drone camera feeds instead of static images.
- **Live APIs:** Replacing static Kaggle CSV datasets with live WebSocket connections to the IRCTC / NTES systems.
- **Cloud Deployment:** Dockerizing the FastAPI backend and deploying it to AWS ECS or Google Kubernetes Engine (GKE) with auto-scaling GPU nodes for the computer vision models.

---

<div align="center">
  <i>Built with passion for the Faraway Hackathon. Transforming the future of railways.</i>
</div>
