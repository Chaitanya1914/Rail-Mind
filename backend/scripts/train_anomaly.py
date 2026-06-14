"""
RailMind — YOLOv8 Training Script
Run this script to train your Anomaly Agent.
"""

import os

def train_model():
    print("============================================================")
    print("  RAILMIND - YOLOv8 ANOMALY TRAINING")
    print("============================================================")
    
    try:
        from ultralytics import YOLO
    except ImportError:
        print("Error: 'ultralytics' is not installed. Run: pip install ultralytics")
        return

    # Check if data exists
    data_yaml = os.path.join(os.path.dirname(__file__), "..", "data", "anomaly_dataset", "data.yaml")
    if not os.path.exists(data_yaml):
        print(f"Error: Dataset not found at {data_yaml}")
        return

    print("[1] Loading YOLOv8 nano model (fastest for hackathons)...")
    model = YOLO("yolov8n.pt")  # Downloads the base model automatically

    print(f"[2] Starting Training on: {data_yaml}")
    print("This will take a few minutes depending on your GPU...")
    
    # Train the model
    results = model.train(
        data=data_yaml,
        epochs=3,        # 3 epochs for fast hackathon demo
        imgsz=640,       # standard YOLO resolution
        batch=16,
        project="anomaly_runs",
        name="rail_defects"
    )

    print("\n✅ Training Complete!")
    print("The trained model weights are saved in: anomaly_runs/rail_defects/weights/best.pt")
    print("The Anomaly Agent will now automatically use this model!")

if __name__ == "__main__":
    train_model()
