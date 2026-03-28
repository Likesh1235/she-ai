def decide_actions(issues):
    decisions = []

    for issue in issues:
        if issue == "Inventory shortage":
            decisions.append({
                "decision": "Switch to alternate supplier",
                "reason": "Inventory is low, switching supplier ensures availability",
                "confidence": "92%",
            })

        elif issue == "Payment failure":
            decisions.append({
                "decision": "Retry payment via UPI",
                "reason": "UPI has higher retry success rate",
                "confidence": "88%",
            })

        elif issue == "Delivery delay":
            decisions.append({
                "decision": "Assign faster courier",
                "reason": "Faster courier reduces delay risk",
                "confidence": "85%",
            })

    return decisions
