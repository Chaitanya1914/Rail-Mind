import os
import sys
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure we can import our agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator import Orchestrator

# ============================================================
# 1. API Security Configuration
# ============================================================
# This is the secret password your teammate's frontend MUST send.
# If they don't send this, Ngrok will drop the connection immediately.
API_KEY_SECRET = "railmind-hackathon-2026"

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API Key")
    return x_api_key

# ============================================================
# 2. Application Setup
# ============================================================
app = FastAPI(title="RailMind Backend API", version="1.0.0")

# Allow all origins so your teammate's Next.js frontend doesn't get blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all domains
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers (like X-API-KEY)
)

# Initialize the Orchestrator ONCE when the server boots
print("Initializing AI Orchestrator...")
# Load the Gemini key from environment or .env file to prevent GitHub leaks
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    GEMINI_API_KEY = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        print("ERROR: .env file not found!")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is missing! Please add it to your .env file.")

orchestrator = Orchestrator(api_key=GEMINI_API_KEY)

# ============================================================
# 3. Pydantic Models (Data Validation)
# ============================================================
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# ============================================================
# 4. API Endpoints
# ============================================================
@app.get("/")
def health_check():
    """Simple endpoint to verify the server is running."""
    return {"status": "RailMind API is Live 🚆", "security": "API Key Required for POST"}

@app.post("/chat", response_model=ChatResponse)
def chat_with_agent(request: ChatRequest, api_key: str = Depends(verify_api_key)):
    """
    This is the main endpoint your teammate will hit.
    It takes their string, passes it to our Agentic Orchestrator, and returns the AI's response.
    """
    try:
        # Pass the message to the Orchestrator
        ai_reply = orchestrator.chat(request.message)
        return ChatResponse(reply=ai_reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting RailMind API Server...")
    # Running directly through python often bypasses Windows PyTorch DLL issues
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
