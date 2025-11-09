from app import create_app
from app.extensions import db  # <--- THIS IS THE FIX

# Create the app instance using our factory
app = create_app()

if __name__ == '__main__':
    app.run(port=5000, debug=True)
