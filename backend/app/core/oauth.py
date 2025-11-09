from authlib.integrations.flask_client import OAuth
from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
from app.extensions import db
from app.models.user import User
from flask_login import login_user

# 1. Create the OAuth "registry" object
oauth = OAuth()

def init_oauth(app):
    """
    Initializes the OAuth registry with our app.
    """
    oauth.init_app(app)
    
    # 2. Register "google" as a client
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        access_token_url='https://accounts.google.com/o/oauth2/token',
        access_token_params=None,
        authorize_url='https://accounts.google.com/o/oauth2/auth',
        authorize_params=None,
        api_base_url='https://www.googleapis.com/oauth2/v1/',
        client_kwargs={'scope': 'openid email profile'},
        userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
    )
