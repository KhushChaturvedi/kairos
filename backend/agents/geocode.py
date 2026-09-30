# agents/geocode.py
# LOCATION FINDER: turns an address or description into map coordinates.
# Order: map click → known Ahmedabad area (offline) → OpenStreetMap search → city centre.

import requests
from typing import Optional, Tuple

CITY_CENTRE = (23.0225, 72.5714)

# Approximate centre points of well-known Ahmedabad areas (works offline).
AREAS = {
    "sg highway": (23.0258, 72.5074),
    "iskcon": (23.0258, 72.5074),
    "navrangpura": (23.0365, 72.5611),
    "maninagar": (22.9962, 72.6030),
    "kalupur": (23.0265, 72.6005),
    "paldi": (23.0110, 72.5630),
    "satellite": (23.0300, 72.5250),
    "vastrapur": (23.0370, 72.5290),
    "bopal": (23.0335, 72.4640),
    "thaltej": (23.0490, 72.5120),
    "bodakdev": (23.0395, 72.5100),
    "prahladnagar": (23.0120, 72.5070),
    "naranpura": (23.0600, 72.5580),
    "naroda": (23.0700, 72.6600),
    "chandkheda": (23.1100, 72.5850),
    "gota": (23.1000, 72.5400),
    "sabarmati": (23.0800, 72.5850),
    "ghatlodia": (23.0600, 72.5400),
    "ellisbridge": (23.0215, 72.5720),
    "ashram road": (23.0300, 72.5700),
    "cg road": (23.0300, 72.5580),
    "law garden": (23.0270, 72.5580),
    "kankaria": (23.0063, 72.6010),
    "jamalpur": (23.0120, 72.5880),
    "lal darwaja": (23.0240, 72.5820),
    "raipur": (23.0180, 72.5950),
    "gomtipur": (23.0150, 72.6150),
    "nikol": (23.0450, 72.6700),
    "vastral": (23.0000, 72.6600),
    "odhav": (23.0280, 72.6650),
    "bapunagar": (23.0400, 72.6300),
    "isanpur": (22.9750, 72.6000),
    "vatva": (22.9650, 72.6300),
    "narol": (22.9700, 72.5900),
    "juhapura": (22.9950, 72.5250),
    "vejalpur": (23.0000, 72.5250),
    "shahibaug": (23.0550, 72.5950),
    "asarwa": (23.0535, 72.6030),
    "motera": (23.0950, 72.5950),
    "airport": (23.0730, 72.6300),
    "science city": (23.0800, 72.4900),
    "civil hospital": (23.0535, 72.6030),
    "railway station": (23.0265, 72.6005),
}


def _from_known_areas(text: str) -> Optional[Tuple[float, float, str]]:
    """Looks for a known area name inside the text. Longest names are checked first."""
    t = text.lower()
    for name in sorted(AREAS, key=len, reverse=True):
        if name in t:
            lat, lng = AREAS[name]
            return lat, lng, name.title()
    return None


def _from_openstreetmap(address: str) -> Optional[Tuple[float, float, str]]:
    """Searches the address online. Returns None if offline, not found, or outside Ahmedabad."""
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": f"{address}, Ahmedabad, Gujarat, India",
                "format": "json",
                "limit": 1,
            },
            headers={"User-Agent": "Kairos-Hackathon/1.0"},
            timeout=4,
        )
        results = r.json()
        if not results:
            return None
        lat, lng = float(results[0]["lat"]), float(results[0]["lon"])
        if not (
            22.85 <= lat <= 23.25 and 72.40 <= lng <= 72.80
        ):  # must be inside Ahmedabad
            return None
        return lat, lng, address.strip()
    except Exception:
        return None


def resolve_location(
    address: Optional[str],
    description: str,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> Tuple[float, float, str, str]:
    """Returns (lat, lng, place_name, source). source is 'map', 'area', 'search' or 'unknown'."""
    if lat is not None and lng is not None:
        return lat, lng, (address.strip() if address else "Pinned on map"), "map"

    for text in [address or "", description]:
        found = _from_known_areas(text)
        if found:
            return found[0], found[1], found[2], "area"

    if address and address.strip():
        found = _from_openstreetmap(address)
        if found:
            return found[0], found[1], found[2], "search"

    return CITY_CENTRE[0], CITY_CENTRE[1], "Unknown location (city centre)", "unknown"
