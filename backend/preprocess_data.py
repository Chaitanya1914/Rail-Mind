"""
RailMind - Data Preprocessing Pipeline
Cleans ir_train.csv and prepares it for XGBoost model training
"""
import pandas as pd
import numpy as np
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("  RAILMIND — DATA PREPROCESSING PIPELINE")
print("=" * 70)

# Load
print("\n[1/7] Loading data...")
start = time.time()
df = pd.read_csv("backend/data/ir_train.csv")
print(f"  Loaded {df.shape[0]:,} rows, {df.shape[1]} columns ({time.time()-start:.1f}s)")

# ============================================================
# STEP 2: DROP USELESS COLUMNS
# ============================================================
print("\n[2/7] Dropping useless columns...")
drop_cols = []

# journey_id — just an identifier
if 'journey_id' in df.columns:
    drop_cols.append('journey_id')

# departure_date — already extracted into year, month, day_of_week
if 'departure_date' in df.columns:
    drop_cols.append('departure_date')

# zone — redundant with zone_abbr
if 'zone' in df.columns and 'zone_abbr' in df.columns:
    drop_cols.append('zone')

# primary_delay_cause — THIS IS DATA LEAKAGE (you can't know the cause before the delay happens)
if 'primary_delay_cause' in df.columns:
    # But save it separately for the Communication Agent to use later
    delay_causes = df[['primary_delay_cause']].copy()
    delay_causes.to_csv("backend/data/delay_causes.csv", index=False)
    print(f"  Saved delay_causes.csv separately (for Communication Agent)")
    drop_cols.append('primary_delay_cause')

# train_number — too many unique values, not useful as a feature directly
if 'train_number' in df.columns:
    drop_cols.append('train_number')

df.drop(columns=drop_cols, inplace=True, errors='ignore')
print(f"  Dropped: {drop_cols}")
print(f"  Remaining columns: {df.shape[1]}")

# ============================================================
# STEP 3: HANDLE NULLS
# ============================================================
print("\n[3/7] Handling null values...")
null_counts = df.isnull().sum()
null_cols = null_counts[null_counts > 0]

if len(null_cols) == 0:
    print("  No null values found! Data is clean.")
else:
    print(f"  Found nulls in {len(null_cols)} columns:")
    for col, count in null_cols.items():
        pct = round(count / len(df) * 100, 2)
        print(f"    {col}: {count:,} nulls ({pct}%)")
        
        # Strategy: fill numeric with median, categorical with mode
        if df[col].dtype in [np.float64, np.int64]:
            df[col].fillna(df[col].median(), inplace=True)
            print(f"      -> Filled with median: {df[col].median()}")
        else:
            df[col].fillna(df[col].mode()[0], inplace=True)
            print(f"      -> Filled with mode: {df[col].mode()[0]}")

# ============================================================
# STEP 4: ENCODE CATEGORICAL VARIABLES
# ============================================================
print("\n[4/7] Encoding categorical variables...")
cat_cols = df.select_dtypes(include=['object']).columns.tolist()
print(f"  Categorical columns to encode: {cat_cols}")

# Use Label Encoding for tree-based models (XGBoost handles it well)
from sklearn.preprocessing import LabelEncoder

label_encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = dict(zip(le.classes_, le.transform(le.classes_)))
    print(f"  {col}: {len(le.classes_)} categories encoded")

# Save encoders for later use in the API
import json
encoders_serializable = {col: {str(k): int(v) for k, v in enc.items()} for col, enc in label_encoders.items()}
with open("backend/data/label_encoders.json", "w") as f:
    json.dump(encoders_serializable, f, indent=2)
print(f"  Saved label_encoders.json (for API decoding)")

# ============================================================
# STEP 5: FEATURE ENGINEERING
# ============================================================
print("\n[5/7] Feature Engineering...")

# Delay per km (how much delay per kilometer of route)
if 'delay_minutes' in df.columns and 'distance_km' in df.columns:
    df['delay_per_km'] = (df['delay_minutes'] / df['distance_km'].replace(0, 1)).round(4)
    print(f"  Created: delay_per_km")

# Delay per stop
if 'delay_minutes' in df.columns and 'num_scheduled_stops' in df.columns:
    df['delay_per_stop'] = (df['delay_minutes'] / df['num_scheduled_stops'].replace(0, 1)).round(4)
    print(f"  Created: delay_per_stop")

# Speed ratio (actual vs scheduled — proxy for efficiency)
if 'distance_km' in df.columns and 'scheduled_travel_hours' in df.columns:
    df['avg_speed_kmph'] = (df['distance_km'] / df['scheduled_travel_hours'].replace(0, 1)).round(2)
    print(f"  Created: avg_speed_kmph")

# Infrastructure score (composite)
infra_cols = ['track_doubled', 'is_electrified', 'is_hdn_route', 'has_lhb_coaches']
existing_infra = [c for c in infra_cols if c in df.columns]
if existing_infra:
    df['infra_score'] = df[existing_infra].sum(axis=1)
    print(f"  Created: infra_score (sum of {existing_infra})")

# Risk score (composite)
risk_cols = ['is_monsoon_season', 'is_fog_risk', 'is_overloaded', 'late_incoming_rake']
existing_risk = [c for c in risk_cols if c in df.columns]
if existing_risk:
    df['risk_score'] = df[existing_risk].sum(axis=1)
    print(f"  Created: risk_score (sum of {existing_risk})")

print(f"  Total features after engineering: {df.shape[1]}")

# ============================================================
# STEP 6: SPLIT FEATURES AND TARGET
# ============================================================
print("\n[6/7] Preparing final dataset...")

target_col = 'delay_minutes'
binary_target = 'is_delayed'

# Separate features and targets
feature_cols = [c for c in df.columns if c not in [target_col, binary_target, 'delay_per_km', 'delay_per_stop']]
# Note: delay_per_km and delay_per_stop are derived FROM the target, so they're leakage for prediction
# But useful for analysis — we'll keep them in the full clean file but exclude from training features

X = df[feature_cols]
y_reg = df[target_col]  # For regression (predict exact minutes)
y_cls = df[binary_target]  # For classification (predict delayed yes/no)

print(f"  Features (X): {X.shape[1]} columns")
print(f"  Target regression (y_reg): delay_minutes")
print(f"  Target classification (y_cls): is_delayed")
print(f"  Feature list: {feature_cols}")

# ============================================================
# STEP 7: SAVE CLEANED DATA
# ============================================================
print("\n[7/7] Saving cleaned data...")

# Save full clean dataset
df.to_csv("backend/data/ir_train_clean.csv", index=False)
print(f"  Saved: ir_train_clean.csv ({df.shape[0]:,} rows, {df.shape[1]} cols)")

# Save feature list
with open("backend/data/feature_columns.json", "w") as f:
    json.dump(feature_cols, f, indent=2)
print(f"  Saved: feature_columns.json")

# Quick verification
print(f"\n{'=' * 70}")
print("  PREPROCESSING COMPLETE!")
print(f"{'=' * 70}")
print(f"\n  Input:  ir_train.csv         ({1_500_000:,} rows, 42 cols)")
print(f"  Output: ir_train_clean.csv   ({df.shape[0]:,} rows, {df.shape[1]} cols)")
print(f"\n  Files created:")
print(f"    1. ir_train_clean.csv     — Cleaned dataset ready for training")
print(f"    2. delay_causes.csv       — Delay causes (for Communication Agent)")
print(f"    3. label_encoders.json    — Category mappings (for API)")
print(f"    4. feature_columns.json   — Feature list (for model loading)")
print(f"    5. exploration_summary.json — Exploration stats")

# Final data types check
print(f"\n  Final column types:")
print(f"    int64:   {len(df.select_dtypes(include=['int64']).columns)}")
print(f"    float64: {len(df.select_dtypes(include=['float64']).columns)}")
print(f"    object:  {len(df.select_dtypes(include=['object']).columns)} (should be 0)")

# Confirm no nulls remain
remaining_nulls = df.isnull().sum().sum()
print(f"\n  Remaining null values: {remaining_nulls} {'✅' if remaining_nulls == 0 else '⚠️'}")
print(f"  Remaining object columns: {len(df.select_dtypes(include=['object']).columns)} {'✅' if len(df.select_dtypes(include=['object']).columns) == 0 else '⚠️'}")
