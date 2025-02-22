from flask import Flask, request, redirect, render_template, session, jsonify
from flask_cors import CORS 
import pandas as pd
import json
import requests
import firebase_admin
from firebase_admin import credentials, auth
import numpy as np
import os

app = Flask(__name__)
CORS(app)


app.secret_key = os.environ.get('SECRET_KEY', 'fallback_secret_key')
app.config.from_pyfile('config.py')

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

@app.route('/')
def home():
    return render_template('index.html')

# Load CSV data
df = pd.read_csv('car_data.csv', encoding='utf-8')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        try:
            # Create a new user in Firebase Authentication
            user = auth.create_user(
                email=email,
                password=password
            )
            return redirect('/login')  # Redirect to login page after successful sign-up
        except Exception as e:
            return f"Error: {str(e)}"

    return render_template('index.html')  # Render the sign-up form

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        if verify_password(email, password):
            user = auth.get_user_by_email(email)
            session['user'] = user.uid
            return redirect('/dashboard')
        else:
            return "Invalid credentials"

    return render_template('index.html')    

@app.route('/logout')
def logout():
    session.pop('user', None)  # Clear the user session
    return redirect('/login')  # Redirect to login page

@app.route('/dashboard')
def dashboard():
    if 'user' in session:
        return render_template('index.html')
    return redirect('/login')  # Redirect to login if user is not authenticated

with open('firebaseConfig.json') as f:
    firebase_config = json.load(f)
    api_key = firebase_config.get('apiKey')  # Extract API key if available

def verify_password(email, password): 
    if not api_key:
        return False  # Prevent login if API key is missing
     
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return True  # Password is correct
    return False  # Password is incorrect

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
    body_type = request.args.get("body-type", "").strip()
    drive_train = request.args.get("drive-train", "").strip()
    transmission = request.args.get("transmission", "").strip()
    fuel_type = request.args.get("fuel-type", "").strip()
    min_hp = request.args.get("horsepower", type=int, default=50)
    min_cargo = request.args.get("cargo-space", type=int, default=150)
    min_price = request.args.get("price", type=int, default=5000)

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

    if brand.lower() != "all brands" and brand != "":
        filtered_df = filtered_df[filtered_df["Brand"].str.lower() == brand.lower()]
    
    if model.lower() != "all models" and model != "":
        filtered_df = filtered_df[filtered_df["Model"].str.lower() == model.lower()]
    
    if body_type != "":
        filtered_df = filtered_df[filtered_df["Body Type"].str.lower() == body_type.lower()]

    if drive_train != "":
        filtered_df = filtered_df[filtered_df["Drive Train"].str.lower() == drive_train.lower()]
    
    if transmission != "":
        filtered_df = filtered_df[filtered_df["Transmission"].str.lower() == transmission.lower()]
    
    if fuel_type != "":
        filtered_df = filtered_df[filtered_df["Fuel Type"].str.lower() == fuel_type.lower()]

    filtered_df = filtered_df[
        (filtered_df["Horsepower"] >= min_hp) &
        (filtered_df["Cargo_space"] >= min_cargo) &
        (filtered_df["Price"] >= min_price)
    ]

    print("\n📊 Filtered DataFrame:")
    print(filtered_df)


    filtered_cars = filtered_df.to_dict(orient="records")  # ✅ Convert DataFrame to list of dictionaries
    print(json.dumps(filtered_cars, indent=4))  # ✅ Now JSON-safe



    return jsonify(filtered_df.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

