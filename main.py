from flask import Flask, request, jsonify, redirect, render_template, session
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

# Load CSV data
df = pd.read_csv('car_data.csv', encoding='utf-8')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        try:
            # Create a new user in Firebase Authentication
            user = auth.create_user(
                email=email,
                password=password
            )
            return redirect('/login')
        except Exception as e:
            return f"Error: {str(e)}"
        
    return render_template('index.html')  # Render the sign-up form

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        try:
            if verify_password(email, password): 
                user = auth.get_user_by_email(email)
                session['user'] = user.uid
                return redirect('/dashboard')
            else:
                return "Invalid credentials"
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 400  # HTTP 400: Bad Request

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)  
    return redirect('/login')  

@app.route('/dashboard', methods=['GET'])
def dashboard():
    if 'user' in session:
        return render_template('index.html')
    return redirect('/login')

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

@app.route('/about')
def about():
    render_template('about.html')

@app.route('/compare')
def about():
    render_template('compare.html')

@app.route('/contacts')
def about():
    render_template('contacts.html')

@app.route('/favourites')
def about():
    render_template('facourites.html')

@app.route('/testimonials')
def about():
    render_template('testimonials.html')


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
        filtered_df = filtered_df[filtered_df["Body Type"].str.lower() == body_type.lower()]

    if drive_train:
        filtered_df = filtered_df[filtered_df["Drive Train"].str.lower().str.contains(drive_train.lower(), na=False)]
    
    if transmission:
        filtered_df = filtered_df[filtered_df["Transmission"].str.lower().str.contains(transmission.lower(), na=False)]
    
    if fuel_type:
        filtered_df = filtered_df[filtered_df["Fuel Type"].str.lower().str.contains(fuel_type.lower(), na=False)]

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

