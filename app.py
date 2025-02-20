from flask import Flask, request, redirect, render_template, session, jsonify
from flask_cors import CORS 
import pandas as pd
import json
import requests
import firebase_admin
from firebase_admin import credentials, auth

app = Flask(__name__)
CORS(app)

# Load your CSV data using pandas
df = pd.read_csv('car_data.csv')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_models_for_brand/<Brand>', methods=['GET'])
def get_models_for_brand(Brand):
    # Filter models based on Brand
    models = df[df['Brand'].str.lower() == Brand.lower()]['Model'].unique().tolist()
    return jsonify(models)

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

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

    return render_template('signup.html')  # Render the sign-up form

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

    return render_template('login.html')    

@app.route('/logout')
def logout():
    session.pop('user', None)  # Clear the user session
    return redirect('/login')  # Redirect to login page

@app.route('/dashboard')
def dashboard():
    if 'user' in session:
        return f"Welcome to the dashboard! User ID: {session['user']}"
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

if __name__ == '__main__':
    app.run(debug=True)
