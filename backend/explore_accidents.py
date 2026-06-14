"""
RailMind — Safety Agent: Data Exploration & Preprocessing
Analyze accidents.csv to determine if ML is feasible
"""
import pandas as pd
import numpy as np
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 70)
print("  SAFETY AGENT — DATA EXPLORATION")
print("=" * 70)

# Load accident data
df = pd.read_csv("backend/data/accidents.csv")
print(f"\n[1/5] BASIC INFO")
print(f"  Rows:    {df.shape[0]}")
print(f"  Columns: {df.shape[1]}")
print(f"  Memory:  {df.memory_usage(deep=True).sum() / 1024:.1f} KB")

# Column overview
print(f"\n[2/5] COLUMN OVERVIEW")
print(f"\n{'Column':<35} {'Dtype':<12} {'Non-Null':<10} {'Null':<8} {'% Null':<8}")
print("-" * 75)
for col in df.columns:
    non_null = df[col].notna().sum()
    null = df[col].isna().sum()
    pct = round(null / len(df) * 100, 1)
    flag = " ⚠️" if pct > 5 else ""
    print(f"  {col:<33} {str(df[col].dtype):<12} {non_null:<10} {null:<8} {pct}%{flag}")

# Show all column names
print(f"\n  All columns: {df.columns.tolist()}")

# Data types
print(f"\n[3/5] DATA TYPES")
numeric = df.select_dtypes(include=[np.number]).columns.tolist()
categorical = df.select_dtypes(include=['object']).columns.tolist()
print(f"  Numeric ({len(numeric)}): {numeric}")
print(f"  Categorical ({len(categorical)}): {categorical}")

# Numeric stats
if numeric:
    print(f"\n[4/5] NUMERIC STATISTICS")
    print(df[numeric].describe().round(2).to_string())

# Categorical value counts
print(f"\n[5/5] CATEGORICAL VALUES")
for col in categorical:
    nunique = df[col].nunique()
    print(f"\n  {col}: {nunique} unique values")
    vc = df[col].value_counts().head(15)
    for val, count in vc.items():
        pct = round(count / len(df) * 100, 1)
        print(f"    {str(val)[:50]:<50} {count:>5}  ({pct}%)")

# Show first 5 rows
print(f"\n{'=' * 70}")
print("FIRST 5 ROWS:")
print(f"{'=' * 70}")
print(df.head().to_string())

# Show last 5 rows
print(f"\n{'=' * 70}")
print("LAST 5 ROWS:")
print(f"{'=' * 70}")
print(df.tail().to_string())

# Duplicates
dupes = df.duplicated().sum()
print(f"\n  Duplicate rows: {dupes}")

# Save summary
summary = {
    "total_rows": int(df.shape[0]),
    "total_columns": int(df.shape[1]),
    "columns": df.columns.tolist(),
    "numeric_columns": numeric,
    "categorical_columns": categorical,
    "null_counts": {col: int(df[col].isna().sum()) for col in df.columns},
    "dtypes": {col: str(df[col].dtype) for col in df.columns}
}

with open("backend/data/accidents_summary.json", "w") as f:
    json.dump(summary, f, indent=2)

print(f"\n  Summary saved to accidents_summary.json")
