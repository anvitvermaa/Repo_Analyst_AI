from flask import Blueprint, redirect, url_for, session
from flask_login import login_user, logout_user, current_user
from app.extensions import oauth, db
from app.models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login/google')
def login_google():
    """
    This is the "door" our React app will call.
    """
    redirect_uri = "http://localhost:5000/api/auth/google/callback"
    
    # --- DEBUGGING STEP 1 ---
    # We are about to create the state. Let's see if the session is working.
    # We will add a test value.
    session['my_test_value'] = 'hello_world'
    print(f"[AUTH LOGIN] Session before redirect: {dict(session)}")
    # --------------------------

    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route('/google/callback')
def google_callback():
    """
    This is the "door" that *Google* calls after the user logs in.
    """
    
    # --- DEBUGGING STEP 2 ---
    # This is the moment of truth. What is in the session *when we get back*?
    # If this print statement shows an EMPTY dictionary {},
    # it PROVES the session is not persisting.
    print(f"[AUTH CALLBACK] Session upon arrival: {dict(session)}")
    # --------------------------

    try:
        token = oauth.google.authorize_access_token()
        
        # --- DEBUGGING STEP 3 ---
        print(f"[AUTH CALLBACK] Token received: {token is not None}")
        # --------------------------
        
        user_info = oauth.google.get('userinfo').json()

        user = User.query.get(user_info['id'])
        
        if not user:
            user = User(
                id=user_info['id'],
                email=user_info['email'],
                display_name=user_info['name'],
                avatar=user_info['picture']
            )
            db.session.add(user)
            db.session.commit()

        login_user(user, remember=True)
        
        return redirect('http://localhost:5173/')

    except Exception as e:
        # --- DEBUGGING STEP 4 ---
        # This is where our error has been coming from.
        # This will now print "mismatching_state" AND the session.
        print(f"[AUTH ERROR] Error: {e} | Session at time of error: {dict(session)}")
        # --------------------------
        return redirect('http://localhost:5173/?error=auth_failed')


@auth_bp.route('/me')
def get_current_user():
    """
    This is the "who am I?" door for our React app.
    """
    if current_user.is_authenticated:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "displayName": current_user.display_name,
            "avatar": current_user.avatar
        }
    else:
        return {"error": "Not authenticated"}, 401


@auth_bp.route('/logout')
def logout():
    """
    This is the "logout" door.
    """
    logout_user() # Clears the session cookie
    return redirect('http://localhost:5173/')