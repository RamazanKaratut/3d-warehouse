# backend/auth/__init__.py

from flask import Blueprint

auth_bp = Blueprint('auth', __name__)

# routes.py dosyasındaki rotaları kaydetmek için import ediyoruz.
from . import routes