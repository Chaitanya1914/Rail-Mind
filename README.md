<div align="center">
  <h1>RailMind: Autonomous Railway Operating System</h1>
  <p><strong>An Agentic Infrastructure OS leveraging ReAct workflows, Computer Vision, and Predictive Machine Learning to automate railway safety and scheduling operations.</strong></p>
  
  [![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)](https://fastapi.tiangolo.com)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
  [![PyTorch](https://img.shields.io/badge/PyTorch-YOLOv8-red.svg)](https://pytorch.org)
  [![Gemini](https://img.shields.io/badge/Google%20AI-Gemini%202.5-orange.svg)](https://ai.google.dev/)
</div>

<br/>

## Executive Summary
The Indian Railways network handles vast logistical and passenger loads daily. Current operational paradigms rely heavily on static scheduling and manual track inspections, leading to compounded delays and delayed responses to critical infrastructure failures.

**RailMind** is an enterprise-grade, Multi-Agent Autonomous Operating System designed to replace legacy rail management infrastructure. By unifying Computer Vision, Graph Theory, and Predictive Machine Learning under a central Large Language Model (LLM) Orchestrator, RailMind shifts railway management from a reactive system to an autonomous, predictive infrastructure.

---

## Agentic Architecture

RailMind operates on a highly decoupled microservices architecture. User queries and system events are parsed by a central Orchestrator, which dynamically routes execution tasks to five specialized sub-agents. 

### 1. The Central Orchestrator
Powered by Google Gemini 2.5 Flash, the Orchestrator acts as the cognitive routing engine. It utilizes a ReAct (Reasoning and Acting) framework to parse complex natural language inputs, determine required computational steps, and invoke the appropriate ML backend agents autonomously.

### 2. Anomaly Detection Agent (Computer Vision)
Utilizes a custom-trained **YOLOv8** Object Detection model built on PyTorch. This agent processes drone and track-side camera feeds to identify structural defects, including micro-fractures, missing fasteners, and degraded sleepers, enabling predictive maintenance prior to catastrophic failure.

### 3. Delay Prediction Agent (Machine Learning)
An **XGBoost Classifier** trained on an extensive dataset of 1.5 million historical Indian Railway transit records. It evaluates real-time variables such as weather conditions, station congestion, and historical precedence to output probabilistic forecasts of train delays.

### 4. Safety & Risk Profiling Agent
A statistical risk analysis engine. It cross-references live train telemetry with historical accident data to generate real-time "Danger Scores." It factors in seasonal environmental risks (e.g., monsoon flooding zones) and hardware degradation metrics.

### 5. Routing Optimization Agent (Graph Theory)
Powered by **NetworkX**, this agent models the railway network as a computational graph comprising over 8,000 stations and 5,000 transit routes. It executes real-time pathfinding algorithms to calculate optimal detours and rerouting solutions during track blockages or high-risk safety alerts.

### 6. Communication & Alerting Agent
A hybrid translation agent that parses raw JSON outputs from the predictive models and translates them into actionable, human-readable crisis alerts. It utilizes an LLM for dynamic alert generation, with a strict fallback to deterministic offline templates in the event of API latency.

---

## Technical Stack
* **Frontend Application:** Next.js, React, TailwindCSS, TypeScript
* **Backend Infrastructure:** FastAPI, Python, Uvicorn
* **Data Science & ML Pipeline:** PyTorch, Ultralytics (YOLOv8), XGBoost, Scikit-Learn, Pandas, NetworkX
* **LLM Engine:** Google Gemini 2.5 Flash API

---

## Deployment Instructions

### 1. Repository Initialization
```bash
git clone https://github.com/Chaitanya1914/Rail-Mind.git
cd Rail-Mind
```

### 2. Backend Environment (AI/ML Services)
```bash
cd backend

# Initialize isolated environment
python -m venv venv
# Windows: .\venv\Scripts\activate
# Unix: source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pandas scikit-learn xgboost networkx ultralytics torch torchvision google-generativeai python-dotenv

# Configure API Authentication
echo "GEMINI_API_KEY=your_google_api_key_here" > .env

# Initialize FastAPI Server
python main.py
```

### 3. Local Tunneling
To expose the local ML server securely to the frontend during development:
```bash
npx localtunnel --port 8000
```

### 4. Frontend Compilation
```bash
cd frontend/railmind/frontend
npm install
npm run dev
```

---

## Scalability and Production Roadmap
While the current iteration serves as a localized prototype for rapid evaluation, the architecture is engineered for cloud-native deployment:
- **Streaming IoT Ingestion:** Transitioning the YOLOv8 inference engine from static batch processing to live RTSP camera feeds using Apache Kafka.
- **Data Warehousing:** Migrating from static CSV datasets to live REST API integrations with the NTES (National Train Enquiry System).
- **Containerization:** Complete Dockerization of the FastAPI microservices for orchestration via Kubernetes (GKE), enabling auto-scaling GPU nodes for the computer vision workloads.
