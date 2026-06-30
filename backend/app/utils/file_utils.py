import os
import shutil
import tempfile


def ensure_dir(path: str):
    """Ensure a directory exists."""
    os.makedirs(path, exist_ok=True)


def create_temp_dir() -> str:
    """Create a temporary directory and return its path."""
    return tempfile.mkdtemp()


def cleanup_dir(path: str):
    """Remove a directory and all its contents."""
    try:
        shutil.rmtree(path)
    except Exception:
        pass
