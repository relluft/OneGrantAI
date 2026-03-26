import sys
import os

# Add the backend directory to sys.path so that backend modules 
# can use their existing relative imports (from models import ..., etc.)
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
sys.path.insert(0, backend_dir)

# Load environment variables from backend/.env
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, ".env"))

from main import app
