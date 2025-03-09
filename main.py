from flask import Flask, request, jsonify, redirect, render_template, session
from flask_cors import CORS 
import pandas as pd
import json
import requests
import firebase_admin
from firebase_admin import credentials, auth, firestore
import numpy as np
import os

app = Flask(__name__)
CORS(app)

app.secret_key = os.environ.get('SECRET_KEY', 'fallback_secret_key')
app.config.from_pyfile('config.py')

cred = credentials.Certificate('serviceAccountKey.json')  # Initialize Firebase credentials
print("✅ Firebase credentials initialized.")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Load CSV data
df = pd.read_csv('car_data.csv', encoding='utf-8')

@app.route('/')  # Home route
def home():
    print("🔍 Rendering home page.")
    return render_template('index.html')  # Render the home page

@app.route('/signup', methods=['POST'])  # Signup route
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('username')
        password = request.form.get('password')

        try:
            # Create a new user in Firebase Authentication
            user = auth.create_user(
                email=email,
                display_name=username,
                password=password
            )
            app.logger.info("✅ User signed up successfully, redirecting to login.")

            return redirect('/login')  # Redirect to login after signup
        except Exception as e:
            return f"Error: {str(e)}"
        
    return render_template('index.html')  # Render the sign-up form

@app.route('/login', methods=['POST'])  # Login route
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        try:
            if verify_password(email, password): 
                user = auth.get_user_by_email(email)
                session['user'] = user.uid
                app.logger.info("✅ User logged in successfully, redirecting to dashboard.")

                return render_template('index.html',  name="{user.display_name}")            
            else:
                return render_template('index.html', error="Incorrect password. Please try again.")

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": str(e)
            }), 400  # HTTP 400: Bad Request

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)  
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

@app.route('/save_user_data', methods=['POST'])  # New route to save user data
def save_user_data():
    if 'user' in session:
        user_id = session['user']
        user_data = request.json  # Get user data from the request

        # Initialize Firestore
        db = firebase_admin.firestore.client()
        
        # Save user data to Firestore
        db.collection('users').document(user_id).set(user_data)
        
        return jsonify({"status": "success", "message": "User data saved successfully."}), 200
    return jsonify({"status": "error", "message": "User not authenticated."}), 403

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/compare')
def compare():
    return render_template('compare.html')

@app.route('/contacts')
def contacts():
    return render_template('contacts.html')

@app.route('/favourites')
def favourites():
    if 'user' in session:
        user_id = session['user']
        user_data = request.json  # Get user data from the request

        # Initialize Firestore
        db = firebase_admin.firestore.client()
        
        # Save user data to Firestore
        db.collection('users').document(user_id).set(user_data)
        
        return render_template('favourites.html')
    return redirect('/login')

@app.route('/testimonials')
def testimonials():
    return render_template('testimonials.html')


# Ensure all relevant columns are strings before extraction
df["Cargo_space"] = df["Cargo_space"].astype(str).str.extract("(\d+)", expand=False).astype(float)
df["Ground_Clearance"] = df["Ground_Clearance"].astype(str).str.extract("([\d.]+)", expand=False).astype(float)
df["Horsepower"] = df["Horsepower"].astype(str).str.extract("(\d+)", expand=False).astype(float)

# Ensure 'Price' is numeric
df["Price"] = pd.to_numeric(df["Price"], errors="coerce")

@app.route('/get_cars', methods=['GET'])  # Get cars route
def get_cars():
    # Debugging - Log received values
    app.logger.info("\n🔍 Received Filters:")  # Log received filters

    # Extract parameters safely with default values
    brand = request.args.get("brand", "").strip()
    model = request.args.get("model", "").strip()
    body_type = request.args.get("body_type", "").strip()
    drive_train = request.args.get("drive_train", "").strip()
    transmission = request.args.get("transmission", "").strip()
    fuel_type = request.args.get("fuel_type", "").strip()
    min_hp = request.args.get("min_hp", type=int, default=50)
    min_cargo = request.args.get("min_cargo", type=int, default=100)
    min_price = request.args.get("min_price", type=int, default=5000)
    min_ground_clearance = request.args.get("min_ground_clearance", type=float, default=13.3)
    seating = request.args.get("seating", type=int, default=None)

    filtered_df = df.copy()  # Create a copy of the DataFrame for filtering


    # 🛠 Handle "Any" selection ("" means no filter applied)
    if brand and brand.lower() not in ["any", "all brands"]:  # Filter by brand if specified

        filtered_df = filtered_df[filtered_df["Brand"].str.lower() == brand.lower()]
    
    if model and model.lower() != "any":  # Filter by model if specified

        filtered_df = filtered_df[filtered_df["Model"].str.lower() == model.lower()]
    
    if body_type:  # Filter by body type if specified

        filtered_df = filtered_df[filtered_df["Body_Type"].str.lower() == body_type.lower()]

    if drive_train:  # Filter by drive train if specified

        filtered_df = filtered_df[filtered_df["Drive_Train"].str.lower().str.contains(drive_train.lower(), na=False)]
        
    if transmission:  # Filter by transmission if specified

        filtered_df = filtered_df[filtered_df["Transmission"].str.lower() == transmission.lower()]
    
    if fuel_type:  # Filter by fuel type if specified

        filtered_df = filtered_df[filtered_df["Fuel_Type"].str.lower().str.contains(fuel_type.lower(), na=False)]

    # 🏎 Apply numerical filters
    filtered_df = filtered_df[  # Apply numerical filters
        (filtered_df["Horsepower"] >= min_hp) &
        (filtered_df["Cargo_space"] >= min_cargo) &
        (filtered_df["Price"] >= min_price) &
        (filtered_df["Ground_Clearance"] >= min_ground_clearance)
    ]
    
    if seating is not None and seating > 0:  # Filter by seating capacity if specified

        filtered_df = filtered_df[filtered_df["Seating_Capacity"] == seating]


    # Debugging: Print filtered results
    app.logger.info("\n📊 Filtered DataFrame:")

    print(filtered_df)

    # Convert DataFrame to JSON
    filtered_cars = filtered_df.fillna("").to_dict(orient="records")

    return jsonify(filtered_cars)  # Return the filtered cars as JSON

@app.route('/get_models', methods=['GET'])
def get_models():
    brand = request.args.get("brand", "").strip()

    if not brand:
        return jsonify([])  # Return empty list if no brand is selected

    # Get unique models for the selected brand
    models = df[df["Brand"].str.lower() == brand.lower()]["Model"].unique().tolist()

    return jsonify(models)

@app.route('/get_variants', methods=['GET'])
def get_variants():
    model = request.args.get("model", "").strip()

    if not model:
        return jsonify([])  # Return empty list if no brand is selected

    # Get unique models for the selected brand
    variants = df[df["Model"].str.lower() == model.lower()]["Variant"].unique().tolist()

    return jsonify(variants)

@app.route('/get_specs', methods=['GET'])
def get_specs():
    variant = request.args.get("variant", "").strip()

    if not variant:
        return jsonify({})  # Return empty object if no variant is provided

    # Filter the dataframe to get the specifications of the given variant
    specs = df[df["Variant"].str.lower() == variant.lower()].iloc[0]
    
    # Create a dictionary with the required specifications
    car_specs = {
        "Brand": str(specs["Brand"]),
        "Model": str(specs["Model"]),
        "Engine": str(specs["Engine"]),
        "Horsepower": int(specs["Horsepower"]),
        "Drive Train": str(specs["Drive_Train"]),
        "Transmission": str(specs["Transmission"]),
        "Body Type": str(specs["Body_Type"]),
        "Fuel Type": str(specs["Fuel_Type"]),
        "Ground Clearance": float(specs["Ground_Clearance"]),
        "Seating Capacity": int(specs["Seating_Capacity"]),
        "Cargo Space": int(specs["Cargo_space"]),
        "Price": float(specs["Price"])
    }

    return jsonify(car_specs)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
