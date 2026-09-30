# main.py
# The API: the 4 doors the frontend knocks on. Each one returns the full State.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import State, ApproveRequest
from state import engine

app = FastAPI(
    title="Kairos API",
    description="Multi-agent emergency response command system (Team Golden Dawn)",
    version="1.0",
)

# CORS: allows the frontend (a different address, e.g. localhost:3000 or
# Manushi's laptop) to call this backend. Without it, the browser blocks requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"name": "Kairos", "status": "online"}


@app.get("/state", response_model=State)
def get_state():
    return engine.get_state()


@app.post("/event", response_model=State)
def trigger_event():
    return engine.trigger_event()


@app.post("/approve", response_model=State)
def approve(body: ApproveRequest):
    return engine.decide(body.approval_id, body.decision)


@app.post("/reset", response_model=State)
def reset():
    return engine.reset()
