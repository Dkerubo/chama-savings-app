# app/views.py

from flask import Blueprint, jsonify

# Create a Blueprint instance
main = Blueprint('main', __name__)

@main.route('/')
def index():
    return jsonify({"message": "Welcome to the Chama App API!"}), 200

@main.route('/health')
def health_check():
    return jsonify({"status": "OK"}), 200
