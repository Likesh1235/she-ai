import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

# Support both `uvicorn main:app` (cwd: backend) and `uvicorn backend.main:app` (cwd: repo root)
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from agents.monitor_agent import monitor_workflow
from agents.decision_agent import decide_actions
from agents.action_agent import execute_actions
from agents.audit_agent import log_audit


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")

    order_id: int | None = Field(default=None)
    inventory: str = Field(default="ok")
    payment: str = Field(default="ok")
    delivery: str = Field(default="ok")


app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/run-workflow")
def run_workflow(order: Order):
    payload = order.model_dump()
    issues = monitor_workflow(payload)
    decisions = decide_actions(issues)
    actions = execute_actions(decisions)
    audit = log_audit(payload, issues, decisions, actions)

    return {
        "issues": issues,
        "decisions": decisions,
        "actions": actions,
        "audit": audit
    }