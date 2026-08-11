"""
AIOS Client Workspace — Configuration Loader

Reads credentials from .env file in workspace root.
Provides helpers for loading API keys.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from workspace root (one level up from scripts/)
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = WORKSPACE_ROOT / ".env"

load_dotenv(ENV_PATH)


def get_env(key, required=False):
    """
    Get an environment variable. Returns None if not set.
    Callers handle missing credentials gracefully (skip the collector).
    `required` is accepted for backward compatibility but has no effect —
    this function never raises.
    """
    value = os.getenv(key, "").strip()
    if not value:
        return None
    return value
