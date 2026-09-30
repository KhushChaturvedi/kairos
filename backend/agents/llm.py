# agents/llm.py
# AI LAYER: calls Google Gemini and caches every answer in llm_cache.json.
# If there's no key, no internet, or any error, it returns None,
# and the caller falls back to rule-based logic. The system never breaks.

import os
import json
import hashlib
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv()  # reads GEMINI_API_KEY and GEMINI_MODEL from backend/.env

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
CACHE_FILE = Path(__file__).resolve().parent.parent / "llm_cache.json"

# Start the Gemini client once, only if a key exists.
_client = None
if API_KEY:
    try:
        from google import genai
        from google.genai import types

        _client = genai.Client(
            api_key=API_KEY,
            http_options=types.HttpOptions(timeout=10000),  # give up after 10 seconds
        )
    except Exception as e:
        print(f"[LLM] Could not start Gemini client: {e}")
        _client = None


def _load_cache() -> dict:
    try:
        return json.loads(CACHE_FILE.read_text())
    except Exception:
        return {}


_cache = _load_cache()


def ask_json(prompt: str) -> Optional[dict]:
    """Sends a prompt to Gemini and returns the answer as a Python dict.
    Checks the cache first. Returns None on any failure."""
    key = hashlib.sha256((MODEL + prompt).encode()).hexdigest()[:16]

    if key in _cache:  # answered before → instant, works offline
        return _cache[key]
    if _client is None:  # no key or client failed to start
        return None

    try:
        from google.genai import types

        response = _client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",  # force a JSON answer
                temperature=0,  # same input → same answer
            ),
        )
        data = json.loads(response.text)
    except Exception as e:
        print(f"[LLM] Call failed, falling back to rules: {e}")
        return None

    _cache[key] = data
    CACHE_FILE.write_text(json.dumps(_cache, indent=2))
    return data


def status() -> dict:
    return {
        "model": MODEL,
        "connected": _client is not None,
        "cached_answers": len(_cache),
    }
