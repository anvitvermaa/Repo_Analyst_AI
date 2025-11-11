import os
import redis
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from app.core.config import (
    DATABASE_URL, SECRET_KEY, 
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
    CELERY_BROKER_URL
)
from app.extensions import db, migrate, login_manager, sess, oauth
from app.core.oauth import init_oauth

load_dotenv()

def create_app():
    """
    This is the "App Factory" function.
    """
    app = Flask(__name__)

    # --- 1. Load Config ---
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    
    # --- THIS IS THE FIX ---
    # We are hardcoding the key to force session signing.
    app.config['SECRET_KEY'] = 'a-real-secret-key-for-testing-123'
    # -----------------------
    
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_REDIS'] = redis.from_url(CELERY_BROKER_URL)
    
    # --- 2. Initialize Extensions (on the app) ---
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    sess.init_app(app)
    login_manager.init_app(app)
    init_oauth(app)

    # --- 3. Import Models & Routes (INSIDE the factory) ---
    with app.app_context():
        from app.models import user 
        
        @login_manager.user_loader
        def load_user(user_id):
            return user.User.query.get(user_id)

        from app.routes.auth import auth_bp
        app.register_blueprint(auth_bp)

    # --- 4. "Hello World" Route ---
    @app.route('/api')
    def hello():
        return jsonify(message="Flask API Server is ALIVE!")
    
    return app