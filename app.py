from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

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
    
    #Get the Filter Values from the Frontend side
    
    brand = request.args.get("brand", "").strip()  
    drive_train = request.args.get("drive_train", "").strip()  
    min_hp = request.args.get('min_hp', type=float, default=50)
    max_hp = request.args.get('max_hp', type=float, default=500)
    min_cargo = request.args.get('min_cargo', type=float, default=150)
    max_cargo = request.args.get('max_cargo', type=float, default=1000)
    min_price = request.args.get('min_price', type=float, default=5000)
    max_price = request.args.get('max_price', type=float, default=80000)
    
    filtered_df = df[
        (df['Horsepower'] >= min_hp) & (df['Horsepower'] <= max_hp) &
        (df['Cargo_space'] >= min_cargo) & (df['Cargo_space'] <= max_cargo) &
        (df['Price'] >= min_price) & (df['Price'] <= max_price)
    ]
    
    print(f"Brand received: {repr(brand)}, Type: {type(brand)}")
    print(f"Drive Train received: {repr(drive_train)}, Type: {type(drive_train)}")
    
    print(request.args)  # See what parameters are being received

    
    if brand:
        filtered_df = filtered_df[filtered_df["Brand"].str.lower() == brand.lower()]
    if drive_train:
        filtered_df = filtered_df[filtered_df["Drive_train"].str.lower() == drive_train.lower()]
    
    """Return the CSV data as JSON."""
    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)

