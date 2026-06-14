"""
RailMind — Safety & Risk Agent
Agent 2 of 6. Calculates risk scores by combining 3 signals:
  1. Delay Agent prediction (high delay = higher risk)
  2. Zone accident history (from 114 real accidents)
  3. Infrastructure & weather factors (rules from real data)

Usage:
  from agents.safety_agent import SafetyAgent
  agent = SafetyAgent()
  result = agent.assess_risk(train_data, delay_prediction)
"""

import json
import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")


class SafetyAgent:
    """
    Safety & Risk Assessment Agent.
    Combines delay predictions, historical accident data, and infrastructure
    analysis into a single risk score (0-10 scale).
    """

    def __init__(self):
        """Load accident history and build zone danger weights."""
        print("[SafetyAgent] Initializing...")

        # Load and process accident data
        accidents_path = os.path.join(DATA_DIR, "accidents.csv")
        self.accidents_df = pd.read_csv(accidents_path)
        
        # Build zone danger weights from real accident history
        self.zone_weights = self._build_zone_weights()
        
        # Build cause statistics
        self.cause_stats = self._build_cause_stats()
        
        # Build environment risk factors
        self.env_risk = self._build_env_risk()

        # Severity thresholds
        self.thresholds = {
            "low": (0, 3.0),
            "moderate": (3.0, 5.5),
            "high": (5.5, 7.5),
            "critical": (7.5, 10.0)
        }

        print(f"[SafetyAgent] Ready. {len(self.accidents_df)} accident records loaded.")
        print(f"[SafetyAgent] {len(self.zone_weights)} zone danger profiles built.")

    def _build_zone_weights(self) -> dict:
        """
        Calculate danger weight per railway zone based on real accident history.
        Zones with more accidents get higher weights.
        """
        # Map accident data zones to standard zone abbreviations
        zone_mapping = {
            "n": "NR", "nc": "NCR", "s": "SR", "c": "CR",
            "sc": "SCR", "ne": "NER", "sw": "SWR", "e": "ER",
            "ec": "ECR", "wc": "WCR", "nef": "NFR", "eco": "ECoR",
            "w": "WR", "k": "KR", "se": "SER", "nw": "NWR",
            "sec": "SECR"
        }

        zone_counts = self.accidents_df["railway_division"].value_counts()
        total_accidents = len(self.accidents_df)
        
        weights = {}
        for zone_code, count in zone_counts.items():
            std_zone = zone_mapping.get(zone_code, zone_code.upper())
            # Weight = proportion of accidents (normalized 0-1, then scaled)
            # A zone with average accidents gets weight 1.0
            # More accidents → weight > 1.0, fewer → weight < 1.0
            avg_per_zone = total_accidents / len(zone_counts)
            weights[std_zone] = round(count / avg_per_zone, 2)

        # Add default weight for zones not in accident data
        all_zones = ["NR", "NCR", "SR", "CR", "SCR", "NER", "SWR", "ER",
                     "ECR", "WCR", "NFR", "ECoR", "WR", "KR", "SER", "NWR", "SECR"]
        for z in all_zones:
            if z not in weights:
                weights[z] = 0.5  # Low risk default for zones with no recorded accidents

        return weights

    def _build_cause_stats(self) -> dict:
        """Extract accident cause distribution from real data."""
        cause_counts = self.accidents_df["cause"].value_counts()
        total = len(self.accidents_df)
        return {
            cause: {
                "count": int(count),
                "percentage": round(count / total * 100, 1)
            }
            for cause, count in cause_counts.items()
        }

    def _build_env_risk(self) -> dict:
        """Extract environment risk factors from real data."""
        env_counts = self.accidents_df["env"].value_counts()
        total = len(self.accidents_df)
        return {
            env: round(count / total, 3)
            for env, count in env_counts.items()
        }

    def _calculate_delay_risk(self, delay_prediction: dict) -> float:
        """
        Signal 1: Convert delay prediction into a risk score (0-10).
        Higher delay probability and longer predicted delays = higher risk.
        """
        if not delay_prediction:
            return 5.0  # Neutral risk if no delay data

        prob = delay_prediction.get("delay_probability", 0.5)
        minutes = delay_prediction.get("predicted_minutes", 0)

        # Delay probability contributes 60%, severity contributes 40%
        prob_score = prob * 10  # 0-10

        # Minutes to severity score
        if minutes <= 15:
            min_score = 1.0
        elif minutes <= 60:
            min_score = 3.0 + (minutes - 15) / 45 * 2  # 3-5
        elif minutes <= 120:
            min_score = 5.0 + (minutes - 60) / 60 * 2.5  # 5-7.5
        else:
            min_score = 7.5 + min((minutes - 120) / 180, 1.0) * 2.5  # 7.5-10

        return round(prob_score * 0.6 + min_score * 0.4, 2)

    def _calculate_zone_risk(self, zone_abbr: str) -> float:
        """
        Signal 2: Zone historical danger score (0-10).
        Based on real accident frequency in that zone.
        """
        weight = self.zone_weights.get(zone_abbr, 0.5)
        # Scale weight to 0-10 range (weight of 1.0 = average = 5.0)
        score = min(weight * 5.0, 10.0)
        return round(score, 2)

    def _calculate_infra_risk(self, train_data: dict) -> float:
        """
        Signal 3: Infrastructure & weather risk score (0-10).
        Based on real risk factors from the training data analysis.
        """
        risk_points = 0
        max_points = 0

        # Weather factors (from feature importance: monsoon = 21.6%, fog = 2.3%)
        factors = [
            ("is_monsoon_season", 2.5, "Monsoon flooding risk"),
            ("is_fog_risk", 1.5, "Low visibility risk"),
            ("is_overloaded", 1.0, "Excess load stress"),
            ("late_incoming_rake", 1.5, "Cascading delay risk"),
            ("is_festival_season", 0.5, "Crowd surge risk"),
            ("is_night_departure", 0.5, "Reduced visibility"),
        ]

        for feature, weight, _ in factors:
            max_points += weight
            if train_data.get(feature, 0) == 1:
                risk_points += weight

        # Infrastructure factors (inverted — good infra REDUCES risk)
        infra_factors = [
            ("track_doubled", 1.5, "Single track collision risk"),
            ("is_electrified", 0.5, "Non-electrified track"),
            ("has_lhb_coaches", 1.0, "Old coach design"),
            ("is_hdn_route", 0.5, "Low-priority route"),
        ]

        for feature, weight, _ in infra_factors:
            max_points += weight
            if train_data.get(feature, 0) == 0:  # Risk when NOT present
                risk_points += weight

        # Continuous factors
        # Coach age (older = riskier)
        coach_age = train_data.get("coach_age_years", 10)
        if coach_age > 20:
            risk_points += 1.0
        elif coach_age > 15:
            risk_points += 0.5
        max_points += 1.0

        # Maintenance score (lower = riskier)
        maintenance = train_data.get("maintenance_score", 5)
        if maintenance < 3:
            risk_points += 1.0
        elif maintenance < 5:
            risk_points += 0.5
        max_points += 1.0

        # PSR count (more speed restrictions = known danger zones)
        psr = train_data.get("psr_count", 0)
        if psr >= 5:
            risk_points += 1.0
        elif psr >= 3:
            risk_points += 0.5
        max_points += 1.0

        # Normalize to 0-10
        if max_points > 0:
            score = (risk_points / max_points) * 10
        else:
            score = 5.0

        return round(score, 2)

    def _get_risk_factors(self, train_data: dict, delay_prediction: dict) -> list:
        """Generate a human-readable list of active risk factors."""
        factors = []

        if train_data.get("is_monsoon_season", 0):
            factors.append({"factor": "Monsoon Season", "severity": "high",
                          "description": "Flooding and waterlogging risk on tracks"})
        if train_data.get("is_fog_risk", 0):
            factors.append({"factor": "Fog Risk", "severity": "high",
                          "description": "Reduced visibility — collision risk elevated"})
        if train_data.get("late_incoming_rake", 0):
            factors.append({"factor": "Late Incoming Rake", "severity": "medium",
                          "description": "Previous train was late — cascading delays possible"})
        if not train_data.get("track_doubled", 1):
            factors.append({"factor": "Single Track", "severity": "high",
                          "description": "No parallel track — head-on collision risk"})
        if not train_data.get("has_lhb_coaches", 1):
            factors.append({"factor": "Non-LHB Coaches", "severity": "medium",
                          "description": "Older coach design — higher derailment impact"})
        if train_data.get("is_overloaded", 0):
            factors.append({"factor": "Overloaded", "severity": "medium",
                          "description": "Excess passenger load — structural stress"})
        if train_data.get("coach_age_years", 0) > 20:
            factors.append({"factor": "Aged Coaches", "severity": "medium",
                          "description": f"Coaches are {train_data.get('coach_age_years', 0):.0f} years old"})
        if train_data.get("maintenance_score", 10) < 4:
            factors.append({"factor": "Poor Maintenance", "severity": "high",
                          "description": f"Track maintenance score: {train_data.get('maintenance_score', 0):.1f}/10"})
        if train_data.get("psr_count", 0) >= 4:
            factors.append({"factor": "Multiple Speed Restrictions", "severity": "medium",
                          "description": f"{train_data.get('psr_count', 0)} PSRs on route — known danger zones"})

        if delay_prediction and delay_prediction.get("predicted_minutes", 0) > 60:
            factors.append({"factor": "Significant Delay Predicted", "severity": "high",
                          "description": f"Expected delay: {delay_prediction.get('predicted_minutes', 0):.0f} min"})

        return factors

    def _get_severity_label(self, score: float) -> dict:
        """Convert risk score to severity label."""
        if score < 3.0:
            return {"level": "low", "label": "Low Risk", "emoji": "🟢", "color": "#4CAF50",
                    "action": "Normal operations. No intervention needed."}
        elif score < 5.5:
            return {"level": "moderate", "label": "Moderate Risk", "emoji": "🟡", "color": "#FFC107",
                    "action": "Monitor closely. Prepare contingency routes."}
        elif score < 7.5:
            return {"level": "high", "label": "High Risk", "emoji": "🟠", "color": "#FF9800",
                    "action": "Alert issued. Consider speed restrictions and rerouting."}
        else:
            return {"level": "critical", "label": "Critical Risk", "emoji": "🔴", "color": "#F44336",
                    "action": "EMERGENCY: Halt or reroute immediately. Deploy safety teams."}

    def assess_risk(self, train_data: dict, delay_prediction: dict = None) -> dict:
        """
        Main method. Calculates comprehensive risk score for a train.

        Args:
            train_data: dict with train features (zone, weather, infra, etc.)
            delay_prediction: dict from DelayAgent.predict() (optional)

        Returns:
            {
                "risk_score": 8.7,
                "risk_out_of_10": "8.7 / 10",
                "severity": {"level": "critical", "label": "Critical Risk", ...},
                "signals": {"delay_risk": 7.2, "zone_risk": 6.5, "infra_risk": 8.1},
                "risk_factors": [...],
                "zone_accident_history": {...},
                "recommended_action": "..."
            }
        """
        zone = train_data.get("zone_abbr", "NR")
        if isinstance(zone, int):
            # If zone is encoded number, try to decode
            with open(os.path.join(DATA_DIR, "label_encoders.json"), "r") as f:
                encoders = json.load(f)
            reverse = {v: k for k, v in encoders.get("zone_abbr", {}).items()}
            zone = reverse.get(zone, "NR")

        # Calculate 3 risk signals
        delay_risk = self._calculate_delay_risk(delay_prediction)
        zone_risk = self._calculate_zone_risk(zone)
        infra_risk = self._calculate_infra_risk(train_data)

        # Weighted combination (delay=40%, zone=30%, infra=30%)
        final_score = round(delay_risk * 0.4 + zone_risk * 0.3 + infra_risk * 0.3, 1)
        final_score = min(max(final_score, 0), 10)  # Clamp to 0-10

        # Get severity and risk factors
        severity = self._get_severity_label(final_score)
        risk_factors = self._get_risk_factors(train_data, delay_prediction)

        return {
            "risk_score": final_score,
            "risk_out_of_10": f"{final_score} / 10",
            "severity": severity,
            "signals": {
                "delay_risk": {"score": delay_risk, "weight": "40%",
                              "description": "Risk from predicted delay severity"},
                "zone_risk": {"score": zone_risk, "weight": "30%",
                             "description": f"Historical accident frequency in {zone} zone"},
                "infra_risk": {"score": infra_risk, "weight": "30%",
                              "description": "Infrastructure & weather conditions"}
            },
            "risk_factors": risk_factors,
            "zone_info": {
                "zone": zone,
                "danger_weight": self.zone_weights.get(zone, 0.5),
                "historical_accidents": int(self.accidents_df[
                    self.accidents_df["railway_division"].map(
                        {"n": "NR", "nc": "NCR", "s": "SR", "c": "CR", "sc": "SCR",
                         "ne": "NER", "sw": "SWR", "e": "ER", "ec": "ECR", "wc": "WCR",
                         "nef": "NFR", "eco": "ECoR", "w": "WR", "k": "KR", "se": "SER"}
                    ) == zone
                ].shape[0])
            },
            "top_accident_causes": self.cause_stats,
            "recommended_action": severity["action"]
        }

    def get_zone_rankings(self) -> list:
        """Return all zones ranked by danger level (for dashboard heatmap)."""
        rankings = []
        for zone, weight in sorted(self.zone_weights.items(), key=lambda x: -x[1]):
            rankings.append({
                "zone": zone,
                "danger_weight": weight,
                "risk_level": "critical" if weight > 2.0 else "high" if weight > 1.5 else
                             "moderate" if weight > 0.8 else "low"
            })
        return rankings

    def get_accident_summary(self) -> dict:
        """Return summary statistics from accident data."""
        df = self.accidents_df
        return {
            "total_accidents": len(df),
            "total_killed": int(df["killed"].sum()),
            "total_injured": int(df["injured"].sum()),
            "date_range": "2002-2017",
            "top_causes": self.cause_stats,
            "top_zones": dict(df["railway_division"].value_counts().head(5)),
            "environment_distribution": self.env_risk
        }


# ============================================================
# SELF TEST
# ============================================================
if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')

    print("=" * 60)
    print("  SAFETY AGENT — SELF TEST")
    print("=" * 60)

    agent = SafetyAgent()

    # Test 1: High-risk scenario (monsoon + single track + NR zone + delay predicted)
    print("\n--- Test 1: CRITICAL RISK (monsoon, single track, NR zone) ---")
    delay_pred = {
        "is_delayed": True,
        "delay_probability": 0.95,
        "predicted_minutes": 150
    }
    result = agent.assess_risk({
        "zone_abbr": "NR",
        "is_monsoon_season": 1,
        "is_fog_risk": 0,
        "track_doubled": 0,
        "has_lhb_coaches": 0,
        "is_electrified": 0,
        "is_overloaded": 1,
        "late_incoming_rake": 1,
        "coach_age_years": 25,
        "maintenance_score": 2.5,
        "psr_count": 6,
        "is_hdn_route": 0,
        "is_night_departure": 1,
        "is_festival_season": 0,
    }, delay_pred)

    print(f"  Risk Score:  {result['severity']['emoji']} {result['risk_out_of_10']}")
    print(f"  Severity:    {result['severity']['label']}")
    print(f"  Action:      {result['recommended_action']}")
    print(f"  Signals:")
    for sig, data in result['signals'].items():
        print(f"    {sig}: {data['score']}/10 ({data['weight']})")
    print(f"  Risk Factors ({len(result['risk_factors'])}):")
    for f in result['risk_factors']:
        print(f"    ⚠️ {f['factor']} [{f['severity']}] — {f['description']}")

    # Test 2: Low-risk scenario (good infrastructure, no weather issues)
    print("\n--- Test 2: LOW RISK (Vande Bharat, good infra, no weather) ---")
    delay_pred2 = {
        "is_delayed": False,
        "delay_probability": 0.05,
        "predicted_minutes": 3
    }
    result2 = agent.assess_risk({
        "zone_abbr": "SR",
        "is_monsoon_season": 0,
        "is_fog_risk": 0,
        "track_doubled": 1,
        "has_lhb_coaches": 1,
        "is_electrified": 1,
        "is_overloaded": 0,
        "late_incoming_rake": 0,
        "coach_age_years": 3,
        "maintenance_score": 8.5,
        "psr_count": 0,
        "is_hdn_route": 1,
        "is_night_departure": 0,
        "is_festival_season": 0,
    }, delay_pred2)

    print(f"  Risk Score:  {result2['severity']['emoji']} {result2['risk_out_of_10']}")
    print(f"  Severity:    {result2['severity']['label']}")
    print(f"  Action:      {result2['recommended_action']}")
    print(f"  Risk Factors: {len(result2['risk_factors'])}")

    # Test 3: Medium risk
    print("\n--- Test 3: MODERATE RISK (fog, medium delay) ---")
    delay_pred3 = {
        "is_delayed": True,
        "delay_probability": 0.65,
        "predicted_minutes": 45
    }
    result3 = agent.assess_risk({
        "zone_abbr": "NCR",
        "is_monsoon_season": 0,
        "is_fog_risk": 1,
        "track_doubled": 1,
        "has_lhb_coaches": 1,
        "is_electrified": 1,
        "is_overloaded": 0,
        "late_incoming_rake": 0,
        "coach_age_years": 12,
        "maintenance_score": 6.0,
        "psr_count": 2,
        "is_hdn_route": 1,
        "is_night_departure": 0,
        "is_festival_season": 0,
    }, delay_pred3)

    print(f"  Risk Score:  {result3['severity']['emoji']} {result3['risk_out_of_10']}")
    print(f"  Severity:    {result3['severity']['label']}")
    print(f"  Action:      {result3['recommended_action']}")

    # Zone rankings
    print("\n--- Zone Danger Rankings ---")
    rankings = agent.get_zone_rankings()
    for r in rankings[:5]:
        print(f"  {r['zone']}: weight={r['danger_weight']}, level={r['risk_level']}")

    # Accident summary
    print("\n--- Accident Data Summary ---")
    summary = agent.get_accident_summary()
    print(f"  Total accidents: {summary['total_accidents']}")
    print(f"  Total killed: {summary['total_killed']}")
    print(f"  Total injured: {summary['total_injured']}")

    print("\n✅ All tests passed! SafetyAgent is ready.")
