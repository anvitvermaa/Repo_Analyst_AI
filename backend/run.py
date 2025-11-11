from app import create_app

app = create_app()

if __name__ == "__main__":
    # --- THIS IS THE FIX ---
    # We run on 'localhost' to match the frontend and redirect URI,
    # which solves the cross-domain cookie problem.
    app.run(debug=True, host='localhost', port=5000)