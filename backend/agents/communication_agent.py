"""
RailMind — Communication Agent
Agent 4 of 6. Translates raw data into human-readable alerts.

Hybrid Architecture:
  1. Tries to use Gemini API for dynamic, impressive alert generation.
  2. Falls back instantly to offline Python templates if API fails or is missing.
"""

import os
import json
from datetime import datetime

# Add backend directory to python path for direct execution
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class CommunicationAgent:
    def __init__(self, api_key: str = None):
        """
        Initializes the agent. If you pass a Gemini API key, it uses the AI.
        Otherwise, it defaults to the offline templates.
        """
        print("[CommunicationAgent] Booting up...")
        self.gemini_enabled = False
        self.model = None

        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("gemini-2.5-flash")
                self.gemini_enabled = True
                print("[CommunicationAgent] AI API Enabled. Generating dynamic alerts.")
            except ImportError:
                print("[CommunicationAgent] google-generativeai not installed. Falling back to templates.")
            except Exception as e:
                print(f"[CommunicationAgent] API Setup failed: {e}. Falling back to templates.")
        else:
            print("[CommunicationAgent] No API key provided. Using 100% reliable offline templates.")

    def generate_alerts(self, train_data: dict, delay_result: dict, safety_result: dict, route_result: dict = None) -> dict:
        """
        Main method. Tries AI first, uses templates as a backup.
        """
        train_name = train_data.get("train_name", "Unknown Train")
        train_number = train_data.get("number", "00000")
        
        # Figure out the severity of the situation
        risk_score = safety_result.get("risk_score", 0) if safety_result else 0
        priority = "LOW"
        if risk_score > 7.5:
            priority = "CRITICAL"
        elif risk_score > 5.0:
            priority = "HIGH"
        
        # If Gemini is enabled, try it!
        if self.gemini_enabled:
            try:
                return self._generate_via_ai(train_name, train_number, priority, delay_result, safety_result, route_result)
            except Exception as e:
                print(f"[CommunicationAgent] AI Generation failed ({e}). Instantly falling back to templates.")
                # Fall through to the template method below
        
        # If no API key or if the API crashed, use the bulletproof templates
        return self._generate_via_templates(train_name, train_number, priority, delay_result, safety_result, route_result)

    def _generate_via_templates(self, name, number, priority, delay, safety, route) -> dict:
        """The bulletproof offline fallback."""
        is_delayed = delay.get("is_delayed", False) if delay else False
        delay_mins = int(delay.get("predicted_minutes", 0)) if delay else 0
        risk_factors = safety.get("risk_factors", []) if safety else []
        
        # Passenger App Notification
        if priority == "CRITICAL" or priority == "HIGH":
            passenger = f"⚠️ ALERT: {name} ({number}) is facing a {delay_mins} min delay due to high risk conditions"
            if risk_factors:
                passenger += f" (Primary cause: {risk_factors[0]['factor']})."
            if route and not route.get("error"):
                passenger += " We have identified a safe alternative route. Please check the boards."
        elif is_delayed:
            passenger = f"ℹ️ INFO: {name} ({number}) is running approximately {delay_mins} minutes behind schedule."
        else:
            passenger = f"✅ {name} ({number}) is running perfectly on time."

        # Station Staff Dashboard
        staff = f"TRAIN {number} | PRIORITY {priority} | DELAY: {delay_mins}m | RISK: {safety.get('risk_score',0)}/10"
        
        # SMS format (must be short)
        sms = passenger[:150] + "..." if len(passenger) > 150 else passenger

        return {
            "method_used": "Offline Templates",
            "priority": priority,
            "passenger_alert": passenger,
            "staff_dashboard": staff,
            "sms_blast": sms
        }

    def _generate_via_ai(self, name, number, priority, delay, safety, route) -> dict:
        """The premium AI generation."""
        prompt = f"""
        You are the Indian Railways AI Communication System.
        Generate 3 alerts for Train {number} ({name}).
        Priority: {priority}
        Delay: {delay}
        Safety Profile: {safety}
        Rerouting Info: {route}
        
        Respond ONLY with a JSON object exactly like this:
        {{
            "passenger_alert": "Short, human-like, conversational text for the passenger app. Get straight to the point. Max 2 sentences.",
            "staff_dashboard": "Ultra-short, punchy bullet points for the station master.",
            "sms_blast": "Short SMS format under 150 characters"
        }}
        """
        
        response = self.model.generate_content(prompt)
        text = response.text.strip()
        
        # Strip markdown formatting if the AI added it
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        data = json.loads(text)
        data["method_used"] = "Gemini AI API"
        data["priority"] = priority
        return data


# ============================================================
# SELF TEST
# ============================================================
if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 60)
    print("  COMMUNICATION AGENT — HYBRID TEST")
    print("=" * 60)

    # We will test without an API key to ensure the offline template works perfectly.
    agent = CommunicationAgent(api_key=None)

    # Dummy data representing what the other agents would output
    train_data = {"train_name": "Rajdhani Express", "number": "12301"}
    delay_data = {"is_delayed": True, "predicted_minutes": 145}
    safety_data = {
        "risk_score": 8.5, 
        "risk_factors": [{"factor": "Monsoon Flooding", "severity": "High"}]
    }
    route_data = {"error": False, "extra_distance_km": 45}

    print("\n--- Generating Alerts... ---")
    alerts = agent.generate_alerts(train_data, delay_data, safety_data, route_data)

    print(f"\nMethod Used: {alerts['method_used']}")
    print(f"Priority:    {alerts['priority']}")
    print(f"\n📲 Passenger App: \n   {alerts['passenger_alert']}")
    print(f"\n💻 Staff Dashboard: \n   {alerts['staff_dashboard']}")
    print(f"\n✉️ SMS Blast: \n   {alerts['sms_blast']}")
    
    print("\n✅ Agent is fully functional!")
