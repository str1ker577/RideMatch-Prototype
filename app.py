import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# Load CSV data
df = pd.read_csv('car_data.csv', encoding='utf-8')

# Ensure all relevant columns are strings before extraction
df["Cargo_space"] = df["Cargo_space"].astype(str).str.extract("(\d+)", expand=False).astype(float)
df["Ground_Clearance"] = df["Ground_Clearance"].astype(str).str.extract("([\d.]+)", expand=False).astype(float)
df["Horsepower"] = df["Horsepower"].astype(str).str.extract("(\d+)", expand=False).astype(float)

# Ensure 'Price' is numeric
df["Price"] = pd.to_numeric(df["Price"], errors="coerce")


@app.route('/get_cars', methods=['GET'])
def get_cars():
    # Extract parameters safely with default values
    brand = request.args.get("brand", "").strip()
    model = request.args.get("model", "").strip()
    body_type = request.args.get("body_type", "").strip()
    drive_train = request.args.get("drive_train", "").strip()
    transmission = request.args.get("transmission", "").strip()
    fuel_type = request.args.get("fuel_type", "").strip()
    min_hp = request.args.get("min_hp", type=int, default=50)
    min_cargo = request.args.get("min_cargo", type=int, default=150)
    min_price = request.args.get("min_price", type=int, default=5000)

    # Debugging - Log received values
    print("\n🔍 Received Filters:")
    print(f"Brand: {repr(brand)}")
    print(f"Model: {repr(model)}")
    print(f"Body Type: {repr(body_type)}")
    print(f"Drive Train: {repr(drive_train)}")
    print(f"Transmission: {repr(transmission)}")
    print(f"Fuel Type: {repr(fuel_type)}")
    print(f"Min HP: {min_hp}")
    print(f"Min Cargo Space: {min_cargo}")
    print(f"Min Price: {min_price}")

    # Start filtering
    filtered_df = df.copy()

    # 🛠 Handle "Any" selection ("" means no filter applied)
    if brand and brand.lower() != "any":
        filtered_df = filtered_df[filtered_df["Brand"].str.lower() == brand.lower()]
    
    if model and model.lower() != "any":
        filtered_df = filtered_df[filtered_df["Model"].str.lower() == model.lower()]
    
    if body_type:
        filtered_df = filtered_df[filtered_df["Body_Type"].str.lower() == body_type.lower()]

    if drive_train:
        filtered_df = filtered_df[filtered_df["Drive_Train"].str.lower().str.contains(drive_train.lower(), na=False)]
    
    if transmission:
        filtered_df = filtered_df[filtered_df["Transmission"].str.lower().str.contains(transmission.lower(), na=False)]
    
    if fuel_type:
        filtered_df = filtered_df[filtered_df["Fuel_Type"].str.lower().str.contains(fuel_type.lower(), na=False)]

    # 🏎 Apply numerical filters
    filtered_df = filtered_df[
        (filtered_df["Horsepower"] >= min_hp) &
        (filtered_df["Cargo_space"] >= min_cargo) &
        (filtered_df["Price"] >= min_price)
    ]

    # Debugging: Print filtered results
    print("\n📊 Filtered DataFrame:")
    print(filtered_df)

    # Convert DataFrame to JSON
    filtered_cars = filtered_df.to_dict(orient="records")
    print("\n📤 Sending response:")
    print(json.dumps(filtered_cars, indent=4))

    return jsonify(filtered_cars)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

