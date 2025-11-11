from app.extensions import oauth  # <-- IMPORT the shared object, don't create a new one
from app.core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

def init_oauth(app):
    """
    Initializes and registers the Google client with our main 'oauth' object.
    We pass 'app' in so we can call init_app here.
    """
    oauth.init_app(app)  # <-- We will call this from our factory
    
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        access_token_url='https://accounts.google.com/o/oauth2/token',
        access_token_params=None,
        authorize_url='https://accounts.google.com/o/oauth2/auth',
        authorize_params=None,
        api_base_url='https://www.googleapis.com/o/oauth2/v1/',
        client_kwargs={'scope': 'openid email profile'},
        userinfo_endpoint='userinfo',
    )