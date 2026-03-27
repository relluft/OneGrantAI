import sys
import os
import json
import traceback

# Add the backend directory to sys.path so that backend modules 
# can use their existing relative imports (from models import ..., etc.)
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
sys.path.insert(0, backend_dir)

# Load environment variables from backend/.env
try:
    from dotenv import load_dotenv
    env_path = os.path.join(backend_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not available — rely on Vercel env vars
    pass

try:
    from main import app
except Exception as e:
    # If import fails, create a minimal FastAPI app that reports the error
    # This makes debugging on Vercel much easier
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(title="OneWeb3Grant API — Fallback")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _import_error = str(e)
    _import_traceback = traceback.format_exc()
    
    # List files for debugging
    _debug_info = {
        "root_dir": root_dir,
        "backend_dir": backend_dir,
        "backend_exists": os.path.isdir(backend_dir),
        "root_files": os.listdir(root_dir) if os.path.isdir(root_dir) else [],
        "backend_files": os.listdir(backend_dir) if os.path.isdir(backend_dir) else [],
        "sys_path": list(sys.path[:5]),
    }

    @app.get("/api/{path:path}")
    @app.post("/api/{path:path}")
    def fallback_handler(path: str):
        return {
            "error": "Backend import failed",
            "detail": _import_error,
            "traceback": _import_traceback,
            "debug": _debug_info,
        }
