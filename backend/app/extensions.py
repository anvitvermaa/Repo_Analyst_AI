from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_session import Session
from authlib.integrations.flask_client import OAuth # <-- We import OAuth here

# --- Create all of our "empty" extension objects ---
# These are not connected to any app yet.
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
sess = Session()
oauth = OAuth() # <-- We create the empty object here
