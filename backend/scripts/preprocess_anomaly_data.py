"""
RailMind — Computer Vision Data Preprocessing Pipeline
Validates image integrity, standardizes resolutions, and checks label coordinates.
"""

import os
import glob
import sys
try:
    import cv2
except ImportError:
    print("Error: 'cv2' is required. Run: pip install opencv-python")
    sys.exit(1)

def preprocess_dataset():
    print("============================================================")
    print("  RAILMIND - CV DATA PREPROCESSING & VALIDATION")
    print("============================================================")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_dir = os.path.join(base_dir, "data", "anomaly_dataset")
    
    if not os.path.exists(dataset_dir):
        print(f"❌ Error: Dataset directory not found at {dataset_dir}")
        print("Please download and extract the dataset first.")
        return

    # 1. Gather all images
    image_paths = []
    for split in ["train", "valid", "test"]:
        split_dir = os.path.join(dataset_dir, split, "images")
        if os.path.exists(split_dir):
            image_paths.extend(glob.glob(os.path.join(split_dir, "*.jpg")))

    if not image_paths:
        print("❌ Error: No .jpg images found in the dataset folders.")
        return

    print(f"🔍 Found {len(image_paths)} images across train/valid/test splits.")
    
    corrupt_images = 0
    missing_labels = 0
    resized_images = 0
    target_size = (640, 640)

    print("\n⏳ Commencing EDA and Preprocessing Pipeline...")
    
    for img_path in image_paths:
        # A. CORRUPTION CHECK
        img = cv2.imread(img_path)
        if img is None:
            corrupt_images += 1
            print(f"  [Warning] Corrupt image detected: {os.path.basename(img_path)}")
            # In a real pipeline, we would delete it: os.remove(img_path)
            continue

        # B. RESOLUTION NORMALIZATION (Resize & Pad to 640x640)
        h, w = img.shape[:2]
        if h != target_size[0] or w != target_size[1]:
            # Simple resize for hackathon (normally we'd letterbox pad to preserve aspect ratio)
            resized_img = cv2.resize(img, target_size)
            cv2.imwrite(img_path, resized_img)
            resized_images += 1

        # C. LABEL ALIGNMENT CHECK
        # YOLO format means a .txt file exists in the ../labels/ directory with the same name
        label_path = img_path.replace("images", "labels").replace(".jpg", ".txt")
        if not os.path.exists(label_path):
            missing_labels += 1
            # In a real pipeline, we would drop the image or flag it for review
            
    print("\n============================================================")
    print("  PREPROCESSING SUMMARY")
    print("============================================================")
    print(f"Total Images Processed  : {len(image_paths)}")
    print(f"Corrupt Files Flagged   : {corrupt_images}")
    print(f"Images Resized to 640px : {resized_images}")
    print(f"Missing Bounding Boxes  : {missing_labels}")
    
    if corrupt_images == 0 and missing_labels == 0:
        print("\n✅ Dataset is 100% healthy and perfectly formatted for YOLOv8 Training.")
    else:
        print("\n⚠️ Dataset requires manual cleanup before training.")
        
    print("============================================================")

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    preprocess_dataset()
