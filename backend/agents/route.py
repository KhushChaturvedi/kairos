# agents/route.py
# ROUTE AGENT: works out how far each resource is from an incident,
# and how many minutes it will take to arrive.

import math
from typing import List, Optional
from models import Resource, Facility

# Average city driving speeds in km/h (Ahmedabad traffic, with sirens).
SPEED_KMPH = {
    "ambulance": 35,
    "rescue_team": 30,
    "fire_truck": 28,
}

# Roads are never a straight line. Real road distance is roughly
# 1.3x the straight-line distance in a city.
ROAD_FACTOR = 1.3

# Time for the crew to get into the vehicle and leave (minutes).
DISPATCH_DELAY_MIN = 1.5


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Straight-line distance between two map points, in kilometres.
    Uses the Haversine formula, which accounts for the Earth being round."""
    R = 6371  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lng2 - lng1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlmb / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


def eta_minutes(resource: Resource, lat: float, lng: float) -> float:
    """Estimated minutes for this resource to reach a location."""
    road_km = haversine_km(resource.lat, resource.lng, lat, lng) * ROAD_FACTOR
    speed = SPEED_KMPH[resource.type]
    travel_min = (road_km / speed) * 60
    return round(travel_min + DISPATCH_DELAY_MIN, 1)


def nearest_facility(
    facilities: List[Facility],
    lat: float,
    lng: float,
    facility_type: str,
    people: int = 1,
) -> Optional[Facility]:
    """Closest hospital or shelter that still has space for 'people'."""
    options = [
        f
        for f in facilities
        if f.type == facility_type and (f.capacity - f.occupied) >= people
    ]
    if not options:
        return None
    return min(options, key=lambda f: haversine_km(f.lat, f.lng, lat, lng))
