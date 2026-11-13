import React, { useMemo, useState, useEffect } from "react";
import { api } from "./api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertCircle, AlertTriangle, ArrowRight, Bell, BookOpen, Check,
  CheckCircle2, ChevronRight, ClipboardList, Clock3, Download, FileText,
  FlaskConical, HeartPulse, Home, Info, LayoutDashboard, Menu, Plus,
  Search, Shield, ShieldCheck, Sparkles, Stethoscope, Trash2, Users, X,
  Pill, BrainCircuit, Network, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import { demoPatients, initialStats } from "./data";
import { analyzePatient, summarize } from "./engine";

const cx = (...parts) => parts.filter(Boolean).join(" ");
const emptyPatient = () => ({
  id: `MG-${Math.floor(1000 + Math.random() * 8999)}`,
  name: "", age: "", sex: "Prefer not to say",
  conditions: [], allergies: [], medications: [{ name: "", dose: "", frequency: "Once daily" }]
});

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analysis", label: "New analysis", icon: FlaskConical },
  { id: "explain", label: "Explainability", icon: Network },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "architecture", label: "How it works", icon: BrainCircuit }
];

function Logo({ small = false }) {
  return <div className="brand"><div className="brand-mark"><ShieldCheck size={small ? 18 : 21} /></div><div><b>MediGuard<span> AI</span></b>{!small && <small>Medication safety intelligence</small>}</div></div>;
}
function Badge({ children, tone = "slate" }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
function Severity({ value }) {
  const tone = value === "High Risk" ? "red" : value === "Moderate" ? "orange" : value === "Caution" ? "yellow" : "green";
  return <Badge tone={tone}><span className="severity-dot" />{value}</Badge>;
}
function Disclaimer() {
  return <div className="disclaimer"><Info size={15}/><span><b>Prototype disclaimer:</b> Demonstration decision-support only. Findings may be incomplete and are not medical advice. Always consult a qualified healthcare professional.</span></div>;
}
function StatCard({ icon: Icon, label, value, change, tone }) {
  return <motion.div className="stat-card card" whileHover={{ y: -3 }} transition={{ duration: .2 }}>
    <div className={`stat-icon ${tone}`}><Icon size={19}/></div>
    <div className="stat-label">{label}</div><div className="stat-value">{value}</div>
    <div className="stat-foot"><span className="tiny-trend">{change}</span><span>illustrative demo data</span></div>
  </motion.div>;
}
function SectionTitle({ eyebrow, title, subtitle, action }) {
  return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

export default function App() {
  const [page, setPage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patient, setPatient] = useState(emptyPatient());
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState("");
  const [demoStep, setDemoStep] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const go = (target) => { setPage(target); setSidebarOpen(false); };
  const loadScenario = (scenario) => {
    const copy = JSON.parse(JSON.stringify(scenario));
    setPatient(copy); setResult(null); setPage("analysis"); setShowDemo(false);
    notify(`${scenario.name} loaded`);
  };
  const updateField = (key, value) => setPatient(p => ({ ...p, [key]: value }));
  const updateMedication = (index, key, value) => setPatient(p => ({
    ...p, medications: p.medications.map((m, i) => i === index ? { ...m, [key]: value } : m)
  }));
  const addMedication = () => updateField("medications", [...patient.medications, { name: "", dose: "", frequency: "Once daily" }]);
  const removeMedication = (index) => updateField("medications", patient.medications.filter((_, i) => i !== index));
  const toggleListValue = (key, value) => {
    const current = patient[key] || [];
    updateField(key, current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  };
  const runAnalysis = () => {
    
const runAnalysis = async () => {
  if (
    !patient.name.trim() ||
    !patient.age ||
    Number(patient.age) < 1 ||
    Number(patient.age) > 120
  ) {
    notify("Enter a patient name and a valid age (1–120).");
    return;
  }

  if (!patient.medications.some(m => m.name.trim())) {
    notify("Add at least one medication.");
    return;
  }

  const clean = {
    ...patient,
    age: Number(patient.age),
    medications: patient.medications.filter(m => m.name.trim())
  };

  // Keep the existing safety engine unchanged
  const next = analyzePatient(clean);

  // Update the frontend immediately
  setPatient(clean);
  setResult(next);
  setHistory(h => [next, ...h].slice(0, 8));
  setPage("explain");

  // Save patient and analysis to the backend
  try {
    await api.savePatient(clean);
    await api.saveAnalysis(clean, next);

    notify("Analysis completed and saved successfully!");
  } catch (error) {
    console.error("Backend save failed:", error);
    notify("Analysis completed locally, but backend saving failed: " + error.message);
  }
};
  };
  const startDemo = () => {
    setShowDemo(true); setDemoStep(0);
    const scenario = JSON.parse(JSON.stringify(demoPatients[0]));
    setPatient(scenario); setResult(null); setPage("analysis");
  };
  const advanceDemo = () => {
    if (demoStep === 0) { setDemoStep(1); notify("Patient profile is ready"); }
    else if (demoStep === 1) { runAnalysis(); setDemoStep(2); }
    else if (demoStep === 2) { go("explain"); setDemoStep(3); }
    else if (demoStep === 3) { go("reports"); setDemoStep(4); }
    else { setShowDemo(false); setDemoStep(0); go("overview"); }
  };

  const counts = result ? summarize(result) : { "High Risk": 1, Moderate: 2, Caution: 4 };
  const pieData = [
    { name: "High risk", value: 18, color: "#ef6b79" },
    { name: "Moderate", value: 42, color: "#f3a65d" },
    { name: "Caution", value: 76, color: "#e8c75e" },
    { name: "No finding", value: 148, color: "#55b99a" }
  ];
  const chartData = [
    { day: "Mon", scans: 34 }, { day: "Tue", scans: 48 }, { day: "Wed", scans: 41 },
    { day: "Thu", scans: 63 }, { day: "Fri", scans: 54 }, { day: "Sat", scans: 72 }, { day: "Sun", scans: 61 }
  ];

  return <div className="app-shell">
    <aside className={cx("sidebar", sidebarOpen && "sidebar-open")}>
      <div className="sidebar-top"><Logo/><button className="icon-btn mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        {navItems.map(item => <button key={item.id} onClick={() => go(item.id)} className={cx("nav-link", page === item.id && "active")}>
          <item.icon size={18}/><span>{item.label}</span>{item.id === "analysis" && <span className="nav-plus"><Plus size={14}/></span>}
        </button>)}
      </nav>
      <div className="sidebar-divider"/>
      <div className="workspace-label">DEMO PATIENTS</div>
      <div className="demo-list">{demoPatients.map((p, i) => <button className="patient-shortcut" key={p.id} onClick={() => loadScenario(p)}>
        <span className={`avatar avatar-${i}`}>{p.name.split(" ").map(x => x[0]).join("")}</span>
        <span><b>{p.name}</b><small>{p.scenario}</small></span>
      </button>)}</div>
      <div className="sidebar-bottom">
        <div className="sidebar-help"><div className="help-icon"><Sparkles size={17}/></div><b>Hackathon demo</b><p>Explore the sample patient scenarios and explainable alerts.</p><button onClick={startDemo}>Start guided demo <ArrowRight size={14}/></button></div>
        <div className="team-mini"><div className="team-avatar">DR</div><div><b>DRisk AI</b><small>INNOVASIA 2K26</small></div><span className="online-dot"/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button>
        <div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{navItems.find(n => n.id === page)?.label || (page === "landing" ? "Welcome" : "Workspace")}</b></div>
        <div className="topbar-right"><div className="prototype-pill"><span/> Prototype environment</div><button className="icon-btn notification-btn" onClick={() => notify("You're all caught up")}><Bell size={18}/><i/></button><div className="top-avatar">DR</div></div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={page} className="page-content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .2 }}>
          {page === "overview" && <Dashboard go={go} loadScenario={loadScenario} history={history} stats={initialStats} pieData={pieData} chartData={chartData}/>}
          {page === "analysis" && <AnalysisPage patient={patient} updateField={updateField} updateMedication={updateMedication} addMedication={addMedication} removeMedication={removeMedication} toggleListValue={toggleListValue} runAnalysis={runAnalysis} loadScenario={loadScenario}/>}
          {page === "explain" && <ExplainPage result={result} patient={patient} go={go}/>}
          {page === "reports" && <ReportsPage result={result} history={history} patient={patient}/>}
          {page === "architecture" && <ArchitecturePage/>}
        </motion.div>
      </AnimatePresence>
      <footer className="main-footer"><span>© 2026 MediGuard AI · Built by <b>Team DRisk AI</b></span><span>INNOVASIA 2K26 <i/> Healthcare + AI</span></footer>
    </main>

    {showDemo && <div className="demo-banner"><div className="demo-banner-icon"><Sparkles size={17}/></div><div><b>Guided demo · Step {Math.min(demoStep + 1, 5)} of 5</b><small>{["Load the sample patient profile","Review the medication profile","Run the safety analysis","Explore explainable findings","Open the generated report"][Math.min(demoStep, 4)]}</small></div><div className="demo-progress"><span style={{ width: `${(demoStep + 1) * 20}%` }}/></div><button className="btn btn-primary btn-small" onClick={advanceDemo}>{demoStep === 4 ? "Finish demo" : demoStep === 1 ? "Analyze now" : "Continue"} <ArrowRight size={14}/></button><button className="icon-btn" onClick={() => setShowDemo(false)}><X size={16}/></button></div>}
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function Dashboard({ go, loadScenario, history, stats, pieData, chartData }) {
  return <div className="page-stack">
    <div className="welcome-row"><div><div className="eyebrow">THURSDAY, NOVEMBER 12, 2026 <span className="live-dot"/></div><h1>Good afternoon, <span>DRisk AI</span></h1><p>Here’s your medication safety intelligence at a glance.</p></div><button className="btn btn-primary" onClick={() => go("analysis")}><Plus size={17}/> New analysis</button></div>
    <Disclaimer/>
    <div className="stats-grid">
      <StatCard icon={Users} label="Patients analyzed" value="1,284" change="+12.8%" tone="purple"/>
      <StatCard icon={ClipboardList} label="Medication checks" value="3,862" change="+8.4%" tone="blue"/>
      <StatCard icon={AlertCircle} label="High-risk alerts" value="18" change="Needs review" tone="red"/>
      <StatCard icon={Activity} label="Moderate alerts" value="42" change="Across demo set" tone="orange"/>
    </div>
    <div className="dashboard-grid">
      <div className="card chart-card"><div className="card-heading"><div><h3>Analysis activity</h3><p>Medication checks performed this week</p></div><Badge tone="purple">This week</Badge></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8c83e8" stopOpacity={.25}/><stop offset="95%" stopColor="#8c83e8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f6"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8992a6", fontSize: 11 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8992a6", fontSize: 11 }}/><Tooltip contentStyle={{ border: "1px solid #edf0f6", borderRadius: 12, boxShadow: "0 8px 24px #20264a12" }}/><Area type="monotone" dataKey="scans" stroke="#8178df" strokeWidth={2.5} fill="url(#scanFill)" activeDot={{ r: 5, fill: "#8178df" }}/></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="card chart-card risk-card"><div className="card-heading"><div><h3>Risk distribution</h3><p>Illustrative alert breakdown</p></div><button className="more-btn" onClick={() => go("reports")}>View report <ArrowRight size={14}/></button></div>
        <div className="risk-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={3} stroke="none">{pieData.map((d, i) => <Cell key={i} fill={d.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-center"><b>284</b><small>findings</small></div></div>
        <div className="legend-grid">{pieData.map(d => <div key={d.name}><span style={{ background: d.color }}/>{d.name}<b>{d.value}</b></div>)}</div>
      </div>
    </div>
    <div className="card recent-card"><div className="card-heading"><div><h3>Try a demo patient</h3><p>Load a fictional profile to explore the safety engine.</p></div><Badge tone="green">3 scenarios</Badge></div>
      <div className="scenario-grid">{demoPatients.map((p, i) => <button className="scenario-card" key={p.id} onClick={() => loadScenario(p)}><div className={`scenario-avatar avatar-${i}`}>{p.name.split(" ").map(x => x[0]).join("")}</div><div className="scenario-content"><b>{p.name}</b><small>{p.scenario}</small><span>{p.medications.length} medications <ArrowRight size={13}/></span></div></button>)}</div>
    </div>
    {history.length > 0 && <div className="card recent-card"><div className="card-heading"><div><h3>Recent analyses</h3><p>Your latest local demo sessions.</p></div></div>{history.slice(0, 3).map((h, i) => <div className="history-row" key={i}><div className="history-icon"><FileText size={17}/></div><div><b>{h.patient.name}</b><small>{h.analyzedAt}</small></div><div className="history-spacer"/><Severity value={h.status}/></div>)}</div>}
  </div>;
}

function AnalysisPage({ patient, updateField, updateMedication, addMedication, removeMedication, toggleListValue, runAnalysis, loadScenario }) {
  const conditions = ["Diabetes", "Hypertension", "Atrial fibrillation", "Chronic kidney disease", "Asthma", "Migraine"];
  const allergies = ["Penicillin", "Sulfa drugs", "Peanuts", "Latex", "None recorded"];
  return <div className="page-stack">
    <SectionTitle eyebrow="PATIENT WORKSPACE" title="New medication analysis" subtitle="Build a patient context, then run the five-check demonstration safety engine." action={<Badge tone="purple"><Shield size={13}/> Secure demo workspace</Badge>}/>
    <Disclaimer/>
    <div className="analysis-layout">
      <div className="form-column">
        <div className="card form-card"><div className="form-heading"><div className="step-number">01</div><div><h3>Patient information</h3><p>Enter the patient's basic details and clinical context.</p></div></div>
          <div className="field-grid"><label className="field"><span>Patient name / identifier <i>*</i></span><input value={patient.name} onChange={e => updateField("name", e.target.value)} placeholder="e.g. Alex Morgan"/></label><label className="field"><span>Age <i>*</i></span><input type="number" min="1" max="120" value={patient.age} onChange={e => updateField("age", e.target.value)} placeholder="Enter age"/></label><label className="field"><span>Patient ID</span><input value={patient.id} onChange={e => updateField("id", e.target.value)} /></label><label className="field"><span>Gender (optional)</span><select value={patient.sex} onChange={e => updateField("sex", e.target.value)}><option>Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></label></div>
          <div className="field-block"><div className="field-label">Existing medical conditions <small>Select all that apply</small></div><div className="chip-options">{conditions.map(c => <button key={c} className={cx("choice-chip", patient.conditions.includes(c) && "selected")} onClick={() => toggleListValue("conditions", c)}>{patient.conditions.includes(c) && <Check size={13} />}{c}</button>)}</div></div>
          <div className="field-block"><div className="field-label">Known allergies <small>Select all that apply</small></div><div className="chip-options">{allergies.map(c => <button key={c} className={cx("choice-chip", patient.allergies.includes(c) && "selected")} onClick={() => toggleListValue("allergies", c)}>{patient.allergies.includes(c) && <Check size={13} />}{c}</button>)}</div></div>
        </div>
        <div className="card form-card"><div className="form-heading"><div className="step-number">02</div><div><h3>Current medications</h3><p>Add each medicine with its entered dose and frequency.</p></div><button className="btn btn-outline btn-small push-right" onClick={addMedication}><Plus size={14}/> Add medicine</button></div>
          <div className="med-list">{patient.medications.map((m, i) => <div className="med-row" key={i}><div className="med-row-icon"><Pill size={17}/></div><label className="field med-name"><span>Medicine name</span><input value={m.name} onChange={e => updateMedication(i, "name", e.target.value)} placeholder="e.g. Warfarin"/></label><label className="field med-dose"><span>Dose</span><input value={m.dose} onChange={e => updateMedication(i, "dose", e.target.value)} placeholder="e.g. 5 mg"/></label><label className="field med-frequency"><span>Frequency</span><select value={m.frequency} onChange={e => updateMedication(i, "frequency", e.target.value)}><option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option><option>Weekly</option></select></label><button className="remove-med" onClick={() => removeMedication(i)} disabled={patient.medications.length === 1} title="Remove medicine"><Trash2 size={16}/></button></div>)}</div>
          <div className="form-note"><Info size={14}/> Dosage checks in this prototype use a limited illustrative threshold, not a clinical dosing reference.</div>
        </div>
        <div className="analysis-actions"><span><i>*</i> Required fields</span><button className="btn btn-primary btn-large" onClick={runAnalysis}><Sparkles size={17}/> Analyze medication safety <ArrowRight size={16}/></button></div>
      </div>
      <aside className="analysis-aside">
        <div className="card aside-card"><div className="aside-icon"><ShieldCheck size={20}/></div><h3>Five independent checks</h3><p>Each category is evaluated using a separate set of demonstration rules.</p>{["Drug–drug interactions","Drug–disease conflicts","Drug–allergy conflicts","Duplicate therapy","Dosage checks"].map((x,i)=><div className="check-row" key={x}><span className="check-number">{String(i+1).padStart(2,"0")}</span>{x}<CheckCircle2 size={15}/></div>)}</div>
        <div className="card aside-card tint-card"><div className="aside-icon purple"><BrainCircuit size={20}/></div><h3>Explainable by design</h3><p>Every matching rule includes a reason, severity, and a professional review suggestion.</p><div className="mini-flow"><span>Patient context</span><ArrowRight size={13}/><span>Safety rules</span><ArrowRight size={13}/><span>Review alerts</span></div></div>
        <div className="card aside-card"><h3>Quick-load a scenario</h3><p>Use a preloaded fictional patient to test the prototype.</p>{demoPatients.map((p,i)=><button className="quick-scenario" key={p.id} onClick={() => loadScenario(p)}><span className={`avatar avatar-${i}`}>{p.name.split(" ").map(x=>x[0]).join("")}</span><span><b>{p.name}</b><small>{p.scenario}</small></span><ChevronRight size={15}/></button>)}</div>
      </aside>
    </div>
  </div>;
}

function ExplainPage({ result, patient, go }) {
  if (!result) return <div className="empty-state card"><div className="empty-icon"><Network size={28}/></div><h2>No analysis to explain yet</h2><p>Start a patient analysis to see the explainable findings and patient context graph.</p><button className="btn btn-primary" onClick={() => go("analysis")}>Start an analysis <ArrowRight size={15}/></button></div>;
  const findings = result.findings;
  const counts = summarize(result);
  return <div className="page-stack">
    <SectionTitle eyebrow="EXPLAINABILITY CENTER" title="Analysis & explainability" subtitle="Understand what the rule engine matched, why it was flagged, and what needs professional review." action={<button className="btn btn-outline" onClick={() => go("reports")}><FileText size={16}/> View report</button>}/>
    <Disclaimer/>
    <div className="result-summary card"><div className="result-patient"><div className="big-avatar">{result.patient.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}</div><div><small>ANALYSIS FOR</small><h3>{result.patient.name}</h3><p>{result.patient.age} years · {result.patient.id} · {result.patient.medications.length} medicines</p></div></div><div className="result-status"><small>OVERALL HIGHEST SEVERITY</small><Severity value={result.status}/><span><Clock3 size={13}/> {result.analyzedAt}</span></div><div className="result-counts"><div><b className="red-text">{counts["High Risk"] || 0}</b><small>High risk</small></div><div><b className="orange-text">{counts.Moderate || 0}</b><small>Moderate</small></div><div><b className="yellow-text">{counts.Caution || 0}</b><small>Caution</small></div></div></div>
    <div className="explain-grid"><div className="findings-column"><div className="subsection-heading"><div><h3>Safety findings</h3><p>{findings.length} matching rule{findings.length === 1 ? "" : "s"} · sorted by severity</p></div><Badge tone="purple">5 checks executed</Badge></div>
      {findings.length === 0 ? <div className="no-findings card"><div className="no-findings-icon"><CheckCircle2 size={24}/></div><h3>No matching demo rules</h3><p>No potential conflicts identified by the current demo rule set.</p><b>This is not a guarantee of clinical safety.</b></div> : findings.map((f,i)=><FindingCard finding={f} index={i} key={f.id}/>)}
    </div><ContextGraph patient={result.patient}/></div>
    <div className="card explain-note"><ShieldCheck size={19}/><div><b>How to interpret this report</b><p>These are rule matches from a deliberately limited illustrative knowledge base. A missing alert does not mean a medication combination is safe. A qualified healthcare professional must review all findings.</p></div></div>
  </div>;
}

function FindingCard({ finding, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const tone = finding.severity === "High Risk" ? "red" : finding.severity === "Moderate" ? "orange" : "yellow";
  return <motion.div className={`finding-card card finding-${tone}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }}>
    <button className="finding-head" onClick={() => setExpanded(!expanded)}><div className={`finding-symbol ${tone}`}>{finding.severity === "High Risk" ? <AlertTriangle size={18}/> : <AlertCircle size={18}/>}</div><div className="finding-title"><div><Badge tone="slate">{finding.type}</Badge><Severity value={finding.severity}/></div><h3>{finding.title}</h3><p>Involved: <b>{finding.involved}</b> · Rule {finding.id}</p></div><ChevronRight className={cx("finding-chevron", expanded && "rotated")} size={18}/></button>
    <AnimatePresence>{expanded && <motion.div className="finding-details" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><div className="explain-detail-grid"><div><span className="detail-label"><Search size={13}/> WHAT</span><p>{finding.what}</p></div><div><span className="detail-label"><BrainCircuit size={13}/> WHY</span><p>{finding.why}</p></div><div><span className="detail-label"><Activity size={13}/> SEVERITY</span><p>{finding.severity} · Prioritized for review based on the configured demo rule.</p></div><div><span className="detail-label"><Stethoscope size={13}/> PROFESSIONAL REVIEW</span><p>{finding.review}</p></div></div><div className="source-line"><Info size={13}/>{finding.source}</div></motion.div>}</AnimatePresence>
  </motion.div>;
}

function ContextGraph({ patient }) {
  return <div className="card graph-card"><div className="card-heading"><div><h3>Patient context graph</h3><p>Connected profile information</p></div><Badge tone="purple">Illustrative map</Badge></div>
    <div className="context-graph">
      <div className="graph-node patient-node"><span><Users size={17}/></span><b>{patient.name}</b><small>Patient · {patient.age} yrs</small></div>
      <div className="graph-branches"><div className="graph-branch"><div className="branch-line"/><div className="graph-node disease-node"><span><HeartPulse size={15}/></span><b>Conditions</b>{(patient.conditions.length ? patient.conditions : ["None entered"]).map(x=><small key={x}>{x}</small>)}</div></div><div className="graph-branch"><div className="branch-line"/><div className="graph-node medicine-node"><span><Pill size={15}/></span><b>Medicines</b>{patient.medications.map((m,i)=><small key={i}>{m.name || "Unnamed medicine"}</small>)}</div></div><div className="graph-branch"><div className="branch-line"/><div className="graph-node allergy-node"><span><AlertCircle size={15}/></span><b>Allergies</b>{(patient.allergies.length ? patient.allergies : ["None entered"]).map(x=><small key={x}>{x}</small>)}</div></div></div>
    </div><div className="graph-caption"><Network size={13}/> Relationship view of the entered profile; not a complete medical knowledge graph.</div>
  </div>;
}

function ReportsPage({ result, history, patient }) {
  const active = result;
  const [savedReports, setSavedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  useEffect(() => {
  let cancelled = false;

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      setReportsError("");

      const data = await api.getAnalyses();

      console.log("Backend reports:", data);

      if (!cancelled) {
        setSavedReports(
          Array.isArray(data)
            ? data
            : data.analyses || data.items || []
        );
      }
    } catch (error) {
      if (!cancelled) {
        console.error("Could not load reports:", error);
        setReportsError(error.message);
      }
    } finally {
      if (!cancelled) setLoadingReports(false);
    }
  };

  loadReports();

  return () => {
    cancelled = true;
  };
}, []);
  const printReport = () => window.print();
  return <div className="page-stack">
    <SectionTitle eyebrow="DOCUMENT CENTER" title="Safety reports" subtitle="Review and print the latest medication safety report." action={<button className="btn btn-primary" onClick={printReport} disabled={!active}><Download size={16}/> Print / Save PDF</button>}/>
    {!active ? <div className="empty-state card"><div className="empty-icon"><FileText size={28}/></div><h2>No report available</h2><p>Run an analysis first. Your generated report will appear here.</p></div> : <div className="report-paper card" id="print-report">
      <div className="report-header"><Logo small/><div className="report-tag">MEDICATION SAFETY REPORT</div></div><div className="report-rule"/>
      <div className="report-title-row"><div><div className="eyebrow">PATIENT REVIEW SUMMARY</div><h2>{active.patient.name}</h2><p>{active.patient.id} · {active.patient.age} years · {active.patient.sex}</p></div><Severity value={active.status}/></div>
      <div className="report-meta"><div><small>ANALYZED ON</small><b>{active.analyzedAt}</b></div><div><small>MEDICATIONS REVIEWED</small><b>{active.patient.medications.length}</b></div><div><small>FINDINGS</small><b>{active.findings.length}</b></div><div><small>CHECKS</small><b>5 categories</b></div></div>
      <h3>Patient context</h3><div className="report-context"><div><small>Conditions</small><b>{active.patient.conditions.join(", ") || "None entered"}</b></div><div><small>Allergies</small><b>{active.patient.allergies.join(", ") || "None entered"}</b></div></div>
      <h3>Medication list</h3><table className="report-table"><thead><tr><th>Medication</th><th>Dose entered</th><th>Frequency</th></tr></thead><tbody>{active.patient.medications.map((m,i)=><tr key={i}><td>{m.name}</td><td>{m.dose || "Not entered"}</td><td>{m.frequency}</td></tr>)}</tbody></table>
      <h3>Findings and professional review</h3>{active.findings.length ? active.findings.map(f=><div className="report-finding" key={f.id}><div><b>{f.title}</b><Severity value={f.severity}/></div><small>{f.type} · {f.id} · {f.involved}</small><p>{f.why}</p><p><b>Review:</b> {f.review}</p></div>) : <div className="report-clear">No potential conflicts identified by the current demo rule set. This is not a guarantee of clinical safety.</div>}
      <div className="report-disclaimer"><b>Important limitation</b><p>This is a demonstration decision-support prototype using a limited illustrative rule set. It is not clinically validated, may miss relevant risks and must not be used to make medical decisions. A qualified healthcare professional must independently review the patient's complete clinical context.</p></div>
      <div className="report-footer">MediGuard AI · Built by Team DRisk AI · INNOVASIA 2K26</div>
    </div>}
    {history.length > 1 && <div className="card recent-card"><div className="card-heading"><div><h3>Previous local sessions</h3><p>Recent analyses stored for this browser session.</p></div></div>{history.slice(1).map((h,i)=><div className="history-row" key={i}><div className="history-icon"><FileText size={16}/></div><div><b>{h.patient.name}</b><small>{h.analyzedAt}</small></div><div className="history-spacer"/><Severity value={h.status}/></div>)}</div>}
  </div>;
}

function ArchitecturePage() {
  const steps = [
    ["01", "Profile entry", "Structured patient information", Users],
    ["02", "Normalization", "Standardize medication names", Search],
    ["03", "Context extraction", "Age, diseases and allergies", Network],
    ["04", "Knowledge query", "Retrieve configured safety rules", BookOpen],
    ["05", "Parallel safety checks", "Five independent rule categories", ShieldCheck],
    ["06", "Risk scoring", "Transparent severity ranking", Activity],
    ["07", "Explanation", "Grounded, readable finding details", BrainCircuit],
    ["08", "Dashboard", "Prioritized alerts and reports", LayoutDashboard],
    ["09", "Clinician review", "Professional makes final decision", Stethoscope]
  ];
  return <div className="page-stack">
    <SectionTitle eyebrow="SYSTEM DESIGN" title="How MediGuard AI works" subtitle="A modular, explainable workflow with deterministic safety decisions and professional oversight." action={<Badge tone="green"><Zap size={13}/> No specialized hardware</Badge>}/>
    <Disclaimer/>
    <div className="card architecture-card"><div className="card-heading"><div><h3>End-to-end methodology</h3><p>From structured patient input to clinician review.</p></div><Badge tone="purple">9 stages</Badge></div>
      <div className="architecture-flow">{steps.map(([n,title,desc,Icon],i)=><React.Fragment key={n}><div className={`architecture-step ${i === 4 ? "highlight-step" : ""}`}><div className="arch-number">{n}</div><div className="arch-icon"><Icon size={19}/></div><div><b>{title}</b><small>{desc}</small></div></div>{i !== steps.length - 1 && <div className="arch-connector"><ArrowRight size={15}/></div>}</React.Fragment>)}</div>
    </div>
    <div className="tech-grid">
      <div className="card tech-card"><div className="tech-icon purple"><BrainCircuit size={20}/></div><h3>Input intelligence</h3><p>NLP and terminology normalization are planned to help parse free-text medication and patient information into structured entities.</p><Badge tone="purple">NLP · Entity recognition</Badge></div>
      <div className="card tech-card"><div className="tech-icon blue"><Network size={20}/></div><h3>Patient context graph</h3><p>Connects patient, condition, medication and allergy entities so checks can consider the entered context.</p><Badge tone="blue">Knowledge graph concept</Badge></div>
      <div className="card tech-card"><div className="tech-icon green"><ShieldCheck size={20}/></div><h3>Deterministic safety engine</h3><p>Configured rules decide which demonstration findings match. Matching is repeatable and inspectable.</p><Badge tone="green">Rule-based logic</Badge></div>
      <div className="card tech-card"><div className="tech-icon orange"><Sparkles size={20}/></div><h3>Explanation layer</h3><p>The current prototype displays explanations stored with each rule. LLM-based explanation is a proposed future enhancement, not integrated.</p><Badge tone="orange">Grounded explanations</Badge></div>
    </div>
    <div className="card stack-card"><h3>Proposed technology stack</h3><div className="stack-pills">{["React.js","Vite","Tailwind CSS","JavaScript","FastAPI / Flask (future backend)","PostgreSQL / MongoDB (future storage)","Docker (deployment option)","REST APIs"].map(x=><span key={x}>{x}</span>)}</div><p>The hackathon prototype runs locally with browser-side mock data and a deterministic JavaScript safety engine.</p></div>
    <div className="card future-card"><div className="future-icon"><Info size={19}/></div><div><b>Prototype scope & next steps</b><p>The current demo uses a small illustrative rule set. A production-oriented implementation would require curated and licensed medical references, clinical review, robust patient-data security, validation, audit trails and appropriate regulatory assessment.</p></div></div>
  </div>;
}