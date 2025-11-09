from celery import Celery
from app.core.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND

celery_app = Celery(
    "worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    # This tells Celery where to find our task functions
    include=["app.core.tasks"]
)

celery_app.conf.update(
    task_track_started=True,
)
