import os
from dotenv import load_dotenv

# Find the .env file in the root of the 'backend' folder
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
load_dotenv(os.path.join(BASE_DIR, '.env'))

# --- Read all our secrets ---
DATABASE_URL = os.getenv('DATABASE_URL')
SECRET_KEY = os.getenv('SECRET_KEY')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

print(f"Loading config from {os.path.join(BASE_DIR, '.env')}")
