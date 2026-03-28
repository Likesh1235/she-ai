def execute_actions(decisions):
    actions = []

    for d in decisions:
        if isinstance(d, dict):
            label = d.get("decision", "Unknown action")
        else:
            label = str(d)
        actions.append(f"Executed: {label}")

    return actions