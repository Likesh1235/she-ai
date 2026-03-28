def monitor_workflow(order):
    issues = []
    inv = order.get("inventory", "ok")
    pay = order.get("payment", "ok")
    deliv = order.get("delivery", "ok")

    if inv == "low":
        issues.append("Inventory shortage")

    if pay == "failed":
        issues.append("Payment failure")

    if deliv == "delayed":
        issues.append("Delivery delay")

    return issues