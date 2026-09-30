# data/seed.py
# The starting city for the simulation. All coordinates are real Ahmedabad locations.
# Functions return FRESH copies every time, so "Reset" always starts clean.

from typing import List
from models import Resource, Facility


# Raw emergency reports. They have NO severity yet;
# the Assessment agent reads the description and decides that.
def initial_reports() -> List[dict]:
    return [
        {
            "id": "INC-01",
            "title": "Truck overturned on SG Highway",
            "description": "A truck has overturned near Iskcon Cross Roads on SG Highway. "
            "4 people injured, 2 trapped inside a car. Traffic blocked.",
            "lat": 23.0258,
            "lng": 72.5074,
        },
        {
            "id": "INC-02",
            "title": "Building fire in Navrangpura",
            "description": "Fire on the 3rd floor of a commercial building in Navrangpura. "
            "Around 12 people inside, smoke spreading, evacuation needed.",
            "lat": 23.0365,
            "lng": 72.5611,
        },
        {
            "id": "INC-03",
            "title": "Cardiac emergency in Maninagar",
            "description": "65 year old man collapsed at home in Maninagar, "
            "suspected heart attack, conscious but in severe pain.",
            "lat": 22.9962,
            "lng": 72.6030,
        },
    ]


def initial_resources() -> List[Resource]:
    data = [
        # (id, name, type, lat, lng)
        ("AMB-01", "Ambulance 01 (Civil Hospital)", "ambulance", 23.0535, 72.6030),
        ("AMB-02", "Ambulance 02 (Ellisbridge)", "ambulance", 23.0215, 72.5720),
        ("AMB-03", "Ambulance 03 (Thaltej)", "ambulance", 23.0490, 72.5120),
        ("AMB-04", "Ambulance 04 (Satellite)", "ambulance", 23.0300, 72.5250),
        ("AMB-05", "Ambulance 05 (Maninagar)", "ambulance", 22.9970, 72.6100),
        ("AMB-06", "Ambulance 06 (Naranpura)", "ambulance", 23.0600, 72.5580),
        ("AMB-07", "Ambulance 07 (Vastrapur)", "ambulance", 23.0370, 72.5290),
        ("AMB-08", "Ambulance 08 (Kalupur)", "ambulance", 23.0270, 72.5950),
        ("RES-01", "Rescue Team 01 (Navrangpura)", "rescue_team", 23.0330, 72.5600),
        ("RES-02", "Rescue Team 02 (Paldi)", "rescue_team", 23.0110, 72.5600),
        ("RES-03", "Rescue Team 03 (Naroda)", "rescue_team", 23.0700, 72.6600),
        ("FIR-01", "Fire Truck 01 (Danapith)", "fire_truck", 23.0240, 72.5880),
        ("FIR-02", "Fire Truck 02 (Prahladnagar)", "fire_truck", 23.0120, 72.5070),
    ]
    return [
        Resource(
            id=i, name=n, type=t, lat=la, lng=ln, status="available", assigned_to=None
        )
        for (i, n, t, la, ln) in data
    ]


def initial_facilities() -> List[Facility]:
    data = [
        # (id, name, type, lat, lng, capacity, occupied)
        ("HOS-01", "Civil Hospital, Asarwa", "hospital", 23.0535, 72.6030, 500, 410),
        ("HOS-02", "SVP Hospital, Ellisbridge", "hospital", 23.0240, 72.5680, 300, 220),
        ("HOS-03", "LG Hospital, Maninagar", "hospital", 22.9990, 72.6040, 200, 150),
        (
            "SHL-01",
            "Navrangpura Community Shelter",
            "shelter",
            23.0420,
            72.5600,
            150,
            20,
        ),
        ("SHL-02", "GMDC Ground Relief Camp", "shelter", 23.0410, 72.5360, 400, 35),
        ("SHL-03", "Kankaria Community Hall", "shelter", 23.0060, 72.6000, 200, 10),
    ]
    return [
        Facility(id=i, name=n, type=t, lat=la, lng=ln, capacity=c, occupied=o)
        for (i, n, t, la, ln, c, o) in data
    ]
