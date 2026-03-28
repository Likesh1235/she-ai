import datetime

def log_audit(order, issues, decisions, actions):
    return {
        "timestamp": str(datetime.datetime.now()),
        "order": order,
        "issues": issues,
        "decisions": decisions,
        "actions": actions,
        "status": "Resolved Automatically"
    }