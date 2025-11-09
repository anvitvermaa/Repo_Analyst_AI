from flask import Blueprint, redirect, url_for, session
from flask_login import login_user, logout_user, current_user
from app.extensions import oauth, db  # <-- Import oauth AND db
from app.models.user import User  # Import our User model

# This creates a "blueprint" (a set of routes)
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login/google')
def login_google():
    """
    This is the "door" our React app will call.
    It tells Authlib to redirect the user to Google.
    """
    # This is the URL our React app will be on
    redirect_uri = "http://localhost:5000/api/auth/google/callback"
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route('/google/callback')
def google_callback():
    """
    This is the "door" that *Google* calls after the user logs in.
    """
    try:
        # Get the "passport" from Google
        token = oauth.google.authorize_access_token()
        # Ask Google for the user's info
        user_info = oauth.google.get('userinfo').json()

        # Find or Create the user in our PostgreSQL database
        user = User.query.get(user_info['id'])
        
        if not user:
            # User is new, create them in our database
            user = User(
                id=user_info['id'],
                email=user_info['email'],
                display_name=user_info['name'],
                avatar=user_info['picture']
            )
            db.session.add(user)
            db.session.commit()

        # Log the user in with Flask-Login. This creates the session cookie.
        login_user(user, remember=True)
        
        # Send the user back to the React app
        return redirect('http://localhost:5173/')

    except Exception as e:
        print(f"Error during Google callback: {e}")
        return redirect('http://localhost:5173/?error=auth_failed')


@auth_bp.route('/me')
def get_current_user():
    """
    This is the "who am I?" door for our React app.
    """
    if current_user.is_authenticated:
        # If they are logged in, send their user info
        return {
            "id": current_user.id,
            "email": current_user.email,
            "displayName": current_user.display_name,
            "avatar": current_user.avatar
        }
    else:
        # If not, send a 401 Unauthorized error
        return {"error": "Not authenticated"}, 401


@auth_bp.route('/logout')
def logout():
    """
    This is the "logout" door.
    """
    logout_user() # Clears the session cookie
    return redirect('http://localhost:5173/')
