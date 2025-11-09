from app.extensions import db  # <-- This is correct
from flask_login import UserMixin # <-- NEW IMPORT

# We add "UserMixin" here. This gives our User model
# all the required properties for session management.
class User(UserMixin, db.Model):
    __tablename__ = 'users' # The name of our table in PostgreSQL

    id = db.Column(db.String(100), primary_key=True) # This will be the Google ID
    email = db.Column(db.String(100), unique=True, nullable=False)
    display_name = db.Column(db.String(100), nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<User {self.email}>'
