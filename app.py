<<<<<<< HEAD
from flask import Flask, jsonify
from flask_cors import CORS 
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load your CSV data using pandas
df = pd.read_csv('car_data.csv')

@app.route('/get_models_for_brand/<Brand>', methods=['GET'])
def get_models_for_brand(Brand):
    # Filter models based on Brand
    models = df[df['Brand'].str.lower() == Brand.lower()]['Model'].unique().tolist()
    return jsonify(models)

if __name__ == '__main__':
    app.run(debug=True)
=======
from flask import Flask, jsonify
from flask_cors import CORS 
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load your CSV data using pandas
df = pd.read_csv('car_data.csv')

@app.route('/get_models_for_brand/<Brand>', methods=['GET'])
def get_models_for_brand(Brand):
    # Filter models based on Brand
    models = df[df['Brand'].str.lower() == Brand.lower()]['Model'].unique().tolist()
    return jsonify(models)

if __name__ == '__main__':
    app.run(debug=True)
>>>>>>> 150aad2c7daf4789815b42617d2076f42d5311e1
