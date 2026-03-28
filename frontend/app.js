let workflowRunning = false;

let issuesCount = 0;
let resolvedCount = 0;
let moneySavedSession = 0;
let accuracy = 78;

const ANALYTICS_KEY = "sheai_analytics_v1";
let chartScenario = null;
let chartSavings = null;

function loadRuns() {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRuns(runs) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(runs.slice(-200)));
  } catch (e) {
    console.warn("SHE-AI: could not save analytics", e);
  }
}

function recordAnalytics(scenario, data) {
  const decisions = Array.isArray(data.decisions) ? data.decisions : [];
  const issues = Array.isArray(data.issues) ? data.issues : [];
  const runs = loadRuns();
  runs.push({
    t: Date.now(),
    scenario: scenario || "unknown",
    issueCount: issues.length,
    decisionCount: decisions.length,
    savings: decisions.length * 5000
  });
  saveRuns(runs);
  renderAnalytics();
}

function renderAnalytics() {
  const elRuns = document.getElementById("stat-total-runs");
  const elIssues = document.getElementById("stat-total-issues");
  const elSave = document.getElementById("stat-total-savings");
  const elAvg = document.getElementById("stat-avg-decisions");
  const c1 = document.getElementById("chartScenarios");
  const c2 = document.getElementById("chartSavings");
  if (!elRuns || !elIssues || !elSave || !elAvg) return;

  const runs = loadRuns();
  const totalRuns = runs.length;
  const totalIssues = runs.reduce((s, r) => s + (r.issueCount || 0), 0);
  const totalSavings = runs.reduce((s, r) => s + (r.savings || 0), 0);
  const totalDecs = runs.reduce((s, r) => s + (r.decisionCount || 0), 0);
  const avgDec = totalRuns ? (totalDecs / totalRuns).toFixed(1) : "0";

  elRuns.textContent = String(totalRuns);
  elIssues.textContent = String(totalIssues);
  elSave.textContent = "INR " + totalSavings.toLocaleString("en-IN");
  elAvg.textContent = avgDec;

  if (typeof Chart === "undefined" || !c1 || !c2) return;

  if (chartScenario) {
    chartScenario.destroy();
    chartScenario = null;
  }
  if (chartSavings) {
    chartSavings.destroy();
    chartSavings = null;
  }

  const keys = ["payment", "inventory", "delivery", "all"];
  const labels = ["Payment", "Inventory", "Delivery", "Multiple"];
  const counts = keys.map((k) => runs.filter((r) => r.scenario === k).length);
  const hasScenarioData = counts.some((n) => n > 0);

  chartScenario = new Chart(c1, {
    type: "doughnut",
    data: {
      labels: hasScenarioData ? labels : ["No runs yet"],
      datasets: [
        {
          data: hasScenarioData ? counts : [1],
          backgroundColor: hasScenarioData
            ? ["#dc2626", "#f59e0b", "#2563eb", "#9333ea"]
            : ["#334155"],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#cbd5e1", boxWidth: 12, padding: 12, font: { size: 11 } }
        }
      }
    }
  });

  const last = runs.slice(-15);
  const labelsLine = last.map((_, i) => String(runs.length - last.length + i + 1));
  chartSavings = new Chart(c2, {
    type: "line",
    data: {
      labels: totalRuns ? labelsLine : ["-"],
      datasets: [
        {
          label: "INR saved",
          data: totalRuns ? last.map((r) => r.savings || 0) : [0],
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34, 211, 238, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#94a3b8", maxRotation: 0 },
          grid: { color: "rgba(255,255,255,0.06)" }
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.06)" },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          labels: { color: "#cbd5e1" }
        }
      }
    }
  });
}

function updateLiveCounters() {
  const ic = document.getElementById("issuesCount");
  const rc = document.getElementById("resolvedCount");
  const ms = document.getElementById("moneySaved");
  if (ic) ic.textContent = String(issuesCount);
  if (rc) rc.textContent = String(resolvedCount);
  if (ms) ms.textContent = moneySavedSession.toLocaleString("en-IN");
}

function improveAI() {
  const el = document.getElementById("learning");
  if (!el) return;
  if (accuracy < 95) {
    accuracy += 2;
    el.textContent = "AI learning accuracy: " + accuracy + "%";
  }
}

function predict() {
  const status = document.getElementById("status");
  if (!status) return;
  const predictions = [
    "Forecast: payment channel instability likely",
    "Forecast: inventory shortage risk in next cycle",
    "Forecast: delivery delays expected under peak load"
  ];
  const random = predictions[Math.floor(Math.random() * predictions.length)];
  status.textContent = random;
  status.className = "text-center mb-5 text-lg sm:text-xl status-yellow max-w-3xl mx-auto px-2";
}

async function autoDemo() {
  if (workflowRunning) return;
  await run("payment");
  await delay(1500);
  await run("inventory");
  await delay(1500);
  await run("delivery");
}

window.predict = predict;
window.autoDemo = autoDemo;

function clearAnalytics() {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
  } catch (e) {
    console.warn(e);
  }
  issuesCount = 0;
  resolvedCount = 0;
  moneySavedSession = 0;
  accuracy = 78;
  const learn = document.getElementById("learning");
  if (learn) learn.textContent = "AI learning accuracy: 78%";
  updateLiveCounters();
  renderAnalytics();
}

window.clearAnalytics = clearAnalytics;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    renderAnalytics();
    updateLiveCounters();
  });
} else {
  renderAnalytics();
  updateLiveCounters();
}

async function run(type) {
  if (workflowRunning) return;
  workflowRunning = true;

  const status = document.getElementById("status");
  const stepsDiv = document.getElementById("steps");
  const decisionsEl = document.getElementById("decisions");
  const auditEl = document.getElementById("audit");
  const impactEl = document.getElementById("impact");

  try {
    if (!status || !stepsDiv || !decisionsEl || !auditEl || !impactEl) {
      console.error("SHE-AI: missing DOM nodes");
      return;
    }

    auditEl.textContent = "";
    auditEl.classList.remove("text-rose-200");

    status.textContent = "AI thinking...";
    status.className = "text-center mb-5 text-lg sm:text-xl status-yellow max-w-3xl mx-auto px-2";

    stepsDiv.innerHTML = "";

    const order = {
      order_id: 1,
      inventory: "ok",
      payment: "ok",
      delivery: "ok"
    };

    if (type === "payment") order.payment = "failed";
    if (type === "inventory") order.inventory = "low";
    if (type === "delivery") order.delivery = "delayed";
    if (type === "all") {
      order.payment = "failed";
      order.inventory = "low";
      order.delivery = "delayed";
    }

    stepsDiv.innerHTML = "<p>1. Monitor - detecting issue...</p>";
    await delay(600);

    stepsDiv.innerHTML += "<p>2. Decision - analyzing solution...</p>";
    await delay(600);

    stepsDiv.innerHTML += "<p>3. Action - executing fix...</p>";
    await delay(600);

    stepsDiv.innerHTML += "<p>4. Audit - logging result...</p>";
    await delay(600);

    status.textContent = "Calling API...";

    let res;
    try {
      res = await fetch("http://127.0.0.1:8000/run-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
    } catch (e) {
      status.textContent = "Network error - is the backend running on port 8000?";
      status.className = "text-center mb-5 text-lg sm:text-xl status-red max-w-3xl mx-auto px-2";
      stepsDiv.innerHTML += '<p class="timeline-step text-rose-300">Could not reach API</p>';
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      status.textContent = "API error";
      status.className = "text-center mb-5 text-lg sm:text-xl status-red max-w-3xl mx-auto px-2";
      auditEl.textContent = JSON.stringify(data, null, 2);
      auditEl.classList.add("text-rose-200");
      return;
    }

    await delay(800);
    status.textContent = "Applying actions...";
    await delay(800);

    status.textContent = "Issue resolved";
    status.className = "text-center mb-5 text-lg sm:text-xl status-green max-w-3xl mx-auto px-2";

    stepsDiv.innerHTML +=
      '<p class="timeline-step text-emerald-300 font-medium">Pipeline complete - agents synchronized</p>';

    const decisions = Array.isArray(data.decisions) ? data.decisions : [];

    decisionsEl.innerHTML =
      decisions.length === 0
        ? '<p class="text-slate-500 text-sm italic">No decisions for this scenario.</p>'
        : decisions
            .map((d) => {
              const row = d && typeof d === "object" ? d : {};
              const conf =
                row.confidence != null && row.confidence !== ""
                  ? escapeHtml(row.confidence)
                  : "N/A";
              return `
      <div class="mb-3 p-3 rounded-lg border border-white/10 bg-white/5 fade-in">
        <p class="font-semibold text-white">${escapeHtml(row.decision)}</p>
        <p class="text-sm text-slate-400 mt-1">${escapeHtml(row.reason)}</p>
        <p class="text-sm text-emerald-400 mt-2 font-medium">Confidence: ${conf}</p>
      </div>
    `;
            })
            .join("");

    auditEl.classList.remove("text-rose-200");
    auditEl.textContent = JSON.stringify(data.audit, null, 2);

    const saved = decisions.length * 5000;
    impactEl.textContent = `Estimated savings: INR ${saved.toLocaleString("en-IN")}`;

    const issues = Array.isArray(data.issues) ? data.issues : [];
    issuesCount += issues.length;
    resolvedCount += decisions.length;
    moneySavedSession += saved;
    updateLiveCounters();

    improveAI();
    recordAnalytics(type, data);
  } catch (e) {
    console.error(e);
    if (status) {
      status.textContent = "Something went wrong";
      status.className = "text-center mb-5 text-lg sm:text-xl status-red max-w-3xl mx-auto px-2";
    }
    if (auditEl) {
      auditEl.classList.add("text-rose-200");
      auditEl.textContent = String(e && e.message ? e.message : e);
    }
  } finally {
    workflowRunning = false;
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  const div = document.createElement("div");
  div.textContent = String(s);
  return div.innerHTML;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
