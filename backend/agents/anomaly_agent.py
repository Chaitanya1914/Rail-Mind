"""
RailMind — Anomaly Agent
Agent 6 of 6. Computer Vision for Track Fault Detection using YOLOv8.
"""

import os
import random

class AnomalyAgent:
    def __init__(self):
        print("[AnomalyAgent] Initializing Computer Vision module...")
        
        # Determine paths
        # base_dir is railmind/backend
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # project root is railmind/
        project_root = os.path.dirname(base_dir)
        self.model_path = os.path.join(project_root, "anomaly_runs", "rail_defects", "weights", "best.pt")
        
        self.model = None
        self.is_demo_mode = False
        
        # Do not load YOLO here to prevent Windows DLL crashes during server boot
        if os.path.exists(self.model_path):
            print("[AnomalyAgent] Custom weights found. YOLO will load on first scan.")
        else:
            print(f"[AnomalyAgent] WARNING: Custom model not found at {self.model_path}")
            print("[AnomalyAgent] Falling back to Demo Mode (Simulation).")
            self.is_demo_mode = True

    def scan_image(self, image_path: str = None) -> dict:
        """
        Scans a track image for physical defects (missing fasteners, cracks).
        """
        if self.is_demo_mode:
            # Hackathon Demo Mode: We simulate finding a defect randomly so the Orchestrator works
            # without forcing you to wait for YOLO to train right now.
            print(f"  [Camera Feed] Scanning: {image_path or 'live_drone_feed_01.jpg'} ...")
            
            # Simulate a 30% chance of finding a critical defect
            is_defective = random.random() < 0.3
            
            if is_defective:
                defect_types = ["Missing Fastener", "Cracked Rail", "Defective Joint"]
                return {
                    "defect_detected": True,
                    "defect_type": random.choice(defect_types),
                    "confidence": round(random.uniform(0.85, 0.98), 2),
                    "image_analyzed": image_path or "live_drone_feed_01.jpg"
                }
            else:
                return {
                    "defect_detected": False,
                    "defect_type": "None",
                    "confidence": 1.0,
                    "image_analyzed": image_path or "live_drone_feed_01.jpg"
                }

        # Real YOLOv8 Inference
        try:
            # Lazily load PyTorch/YOLO to avoid Windows DLL errors during fastAPI boot
            if self.model is None:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                
            print(f"  [Camera Feed] Running YOLOv8 on: {image_path}")
            results = self.model(image_path)
            
            # Parse the results (bounding boxes)
            boxes = results[0].boxes
            if len(boxes) > 0:
                # Get the highest confidence detection
                best_box = boxes[0]
                class_id = int(best_box.cls[0])
                confidence = float(best_box.conf[0])
                class_name = self.model.names[class_id]
                
                # If the dataset classes include specific faults, we flag them
                return {
                    "defect_detected": True,
                    "defect_type": class_name,
                    "confidence": round(confidence, 2),
                    "image_analyzed": image_path
                }
            else:
                return {
                    "defect_detected": False,
                    "defect_type": "None",
                    "confidence": 1.0,
                    "image_analyzed": image_path
                }
        except Exception as e:
            return {
                "error": str(e),
                "defect_detected": False,
                "defect_type": "Error during processing"
            }

# ============================================================
# SELF TEST
# ============================================================
if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 60)
    print("  ANOMALY AGENT — VISION TEST")
    print("=" * 60)
    agent = AnomalyAgent()
    result = agent.scan_image()
    
    print("\n--- Detection Results ---")
    if result.get("defect_detected"):
        print(f"⚠️ ALERT: {result['defect_type']} detected! (Confidence: {result['confidence']})")
    else:
        print("✅ Track clear. No defects found.")
