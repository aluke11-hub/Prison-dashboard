import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// DATA LOADER
// All numbers come from /data/live_data.json — updated monthly by GitHub Actions
// ─────────────────────────────────────────────────────────────────────────────
function useData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/data/live_data.json")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => {
        console.error("Failed to load live_data.json:", e);
        setError(e.message);
      });
  }, []);

  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA (changes rarely — update manually when needed)
// ─────────────────────────────────────────────────────────────────────────────

const STATE_COMMITTEES = {
  CA: "Senate Budget Subcommittee No. 5; Assembly Budget Sub. 5",
  TX: "Senate Finance; House Appropriations — Article V (Public Safety)",
  NY: "Senate Finance; Assembly Ways & Means (Public Protection)",
  FL: "Senate Approps — Criminal & Civil Justice; House Justice Appropriations",
  PA: "Senate Appropriations; House Appropriations",
  OH: "Senate Finance; House Finance — Criminal Justice Sub.",
  IL: "Senate Appropriations II; House Appropriations — Criminal Justice",
  MI: "Senate Corrections Appropriations Sub.; House Corrections Approps Sub.",
  WI: "Joint Finance Committee (JFC)",
  MA: "Senate Ways & Means; House Ways & Means (Public Safety)",
  WA: "Senate Ways & Means; House Appropriations",
  NJ: "Senate Budget & Appropriations; Assembly Budget",
  CO: "Joint Budget Committee (JBC)",
  AZ: "Senate Appropriations; House Appropriations (Public Safety)",
  GA: "Senate Appropriations (Public Safety Sub.); House Appropriations",
  NC: "Senate Appropriations on Justice & Public Safety; House Appropriations J&PS",
  VA: "Senate Finance & Appropriations; House Appropriations (Public Safety)",
  MD: "Senate Budget & Taxation; House Appropriations",
  OR: "Joint Ways & Means — Public Safety Sub.",
  TN: "Senate Finance, Ways & Means; House Finance, Ways & Means",
  MO: "Senate Appropriations; House Budget",
  MN: "Senate Finance; House Ways & Means — Public Safety Finance",
  IN: "Senate Appropriations; House Ways & Means",
  KY: "Senate Appropriations & Revenue; House Appropriations & Revenue",
  SC: "Senate Finance; House Ways & Means",
  NV: "Senate Finance; Assembly Ways & Means",
  OK: "Senate Appropriations; House Appropriations (Public Safety)",
  LA: "Senate Finance; House Appropriations (Public Safety)",
  AL: "Senate Finance & Taxation; House Ways & Means — General Fund",
  AR: "Senate Revenue & Tax; House Appropriations (State Agencies)",
  KS: "Senate Ways & Means; House Appropriations",
  IA: "Senate Appropriations; House Appropriations — Justice Systems",
  MS: "Senate Appropriations; House Appropriations",
  NM: "Senate Finance; House Appropriations & Finance",
  AK: "Senate Finance; House Finance — Corrections Sub.",
  NE: "Unicameral Appropriations Committee",
  ID: "Senate Finance; House Appropriations — Justice & Rules",
  UT: "Senate & House Executive Appropriations Committees",
  MT: "Senate Finance & Claims; House Appropriations",
  HI: "Senate Ways & Means; House Finance",
  CT: "Senate Appropriations; House Appropriations",
  WV: "Senate Finance; House Finance",
  DE: "Senate Finance; House Appropriations & Finance",
  WY: "Senate Appropriations; House Appropriations",
  SD: "Senate Appropriations; House Appropriations",
  ND: "Senate Appropriations; House Appropriations",
  RI: "Senate Finance; House Finance",
  NH: "Senate Finance; House Finance",
  VT: "Senate Appropriations; House Appropriations",
  ME: "Senate Appropriations; House Appropriations"
};

const FEDERAL_COMMITTEES = [
  {
    chamber: "SENATE", role: "Appropriator",
    committee: "Committee on Appropriations",
    subcommittee: "Subcommittee on Commerce, Justice, Science (CJS)",
    chair: "Full Committee: Sen. Susan Collins (R-ME)",
    ranking: "Sen. Patty Murray (D-WA)",
    jurisdiction: "Annual appropriations for BOP (Federal Prison System S&E, acct 15-1060) and U.S. Marshals Service (prisoner detention). FY2026 S.2354 includes $10.1B+ for DOJ.",
    url: "appropriations.senate.gov", color: "#b91c1c"
  },
  {
    chamber: "SENATE", role: "Appropriator",
    committee: "Committee on Appropriations",
    subcommittee: "Subcommittee on Homeland Security",
    chair: "Subcommittee Chair: Sen. Katie Britt (R-AL)",
    ranking: "Sen. Chris Murphy (D-CT)",
    jurisdiction: "Annual appropriations for ICE Detention & Removal (Custody Operations PPA). Reviews ICE bed count budgets. The OBBBA $45B was routed through reconciliation, bypassing this committee.",
    url: "appropriations.senate.gov", color: "#b91c1c"
  },
  {
    chamber: "SENATE", role: "Policy Oversight",
    committee: "Committee on the Judiciary",
    subcommittee: "Subcommittee on Crime & Terrorism",
    chair: "Ranking: Sen. Dick Durbin (D-IL)",
    ranking: "",
    jurisdiction: "Policy oversight of BOP operations, conditions of confinement, Federal Prison Oversight Act (2024) implementation, sentencing, reentry programs.",
    url: "judiciary.senate.gov", color: "#b91c1c"
  },
  {
    chamber: "SENATE", role: "Policy Oversight",
    committee: "Committee on the Judiciary",
    subcommittee: "Subcommittee on Immigration, Border Security & Enforcement",
    chair: "Chair: Sen. Tom Cotton (R-AR)",
    ranking: "Sen. Alex Padilla (D-CA)",
    jurisdiction: "Oversight of ICE detention conditions, immigration enforcement, DHS immigration functions. Reviews post-OBBBA detention expansion.",
    url: "judiciary.senate.gov", color: "#b91c1c"
  },
  {
    chamber: "HOUSE", role: "Appropriator",
    committee: "Committee on Appropriations",
    subcommittee: "Subcommittee on Commerce, Justice, Science (CJS)",
    chair: "Chair: Rep. Harold Rogers (R-KY)",
    ranking: "Rep. Grace Meng (D-NY)",
    jurisdiction: "Annual appropriations for BOP (acct 15-1060) and USMS. FY2026 H.R.5342 includes $10.124B for BOP. Rogers held BOP oversight hearing Feb. 2025.",
    url: "appropriations.house.gov", color: "#1d4ed8"
  },
  {
    chamber: "HOUSE", role: "Appropriator",
    committee: "Committee on Appropriations",
    subcommittee: "Subcommittee on Homeland Security",
    chair: "Chair: Rep. Mark Amodei (R-NV)",
    ranking: "Rep. David Price (D-NC)",
    jurisdiction: "Annual ICE base appropriations. OBBBA $45B + $29.9B bypassed this subcommittee via reconciliation.",
    url: "appropriations.house.gov", color: "#1d4ed8"
  },
  {
    chamber: "HOUSE", role: "Policy Oversight",
    committee: "Committee on the Judiciary",
    subcommittee: "Subcommittee on Crime and Federal Government Surveillance",
    chair: "Chair: Rep. Andy Biggs (R-AZ)",
    ranking: "Rep. Lucy McBath (D-GA)",
    jurisdiction: "Primary BOP oversight. Joint hearing 'Federal Corrections in Focus' May 6, 2025. Jurisdiction: federal corrections, rehabilitation, reentry.",
    url: "judiciary.house.gov", color: "#1d4ed8"
  },
  {
    chamber: "HOUSE", role: "Policy Oversight",
    committee: "Committee on the Judiciary",
    subcommittee: "Subcommittee on Immigration Integrity, Security & Enforcement",
    chair: "Chair: Rep. Tom McClintock (R-CA)",
    ranking: "Rep. Pramila Jayapal (D-WA)",
    jurisdiction: "Oversight of ICE detention standards, private contractor accountability, conditions in the post-OBBBA expanded detention system.",
    url: "judiciary.house.gov", color: "#1d4ed8"
  },
  {
    chamber: "HOUSE", role: "Policy Oversight",
    committee: "Committee on Homeland Security",
    subcommittee: "Full Committee + Subcommittee on Border Security & Enforcement",
    chair: "Full Committee Chair: Rep. Mark Green (R-TN)",
    ranking: "Rep. Bennie Thompson (D-MS)",
    jurisdiction: "Authorization & oversight of DHS, CBP, ICE. Reviews $45B OBBBA detention construction program and private contractor oversight.",
    url: "homeland.house.gov", color: "#1d4ed8"
  },
];

const TOP15_COMMITTEE_DETAILS = [
  { state:"CA", budget:11.09, agency:"CDCR", appro:"Senate Budget Subcommittee No. 5 on Corrections, Public Safety, Judiciary; Assembly Budget Sub. 5", policy:"Senate Public Safety; Assembly Public Safety", chair:"Sub. 5 Chair: Sen. Aisha Wahab (D)", notes:"CDCR total budget ~$13.6B. JLBC provides year-round oversight. Detailed spring hearings each year." },
  { state:"NY", budget:3.9,  agency:"DOCCS", appro:"Senate Finance; Assembly Ways & Means (Public Protection area)", policy:"Senate Crime Victims, Crime & Correction; Assembly Correction", chair:"Senate Finance: Sen. Liz Krueger (D)", notes:"Executive Budget process. 'Public Protection' budget function. Assembly Correction Committee has standalone DOCCS oversight." },
  { state:"TX", budget:3.6,  agency:"TDCJ", appro:"Senate Finance (Criminal Justice Article); House Appropriations — Article V", policy:"Senate Criminal Justice; House Corrections", chair:"LBB oversees biennial budget; House Corrections: direct TDCJ oversight", notes:"Biennial budget. Legislative Budget Board (LBB) does continuous performance monitoring." },
  { state:"FL", budget:2.8,  agency:"FDC", appro:"Senate Appropriations on Criminal & Civil Justice; House Justice Appropriations Sub.", policy:"Senate Criminal Justice; House Criminal Justice & Public Safety Sub.", chair:"Senate Crim. & Civil Justice Approps: Sen. Clay Yarborough (R)", notes:"Aging facilities (pre-1980, no A/C) are recurring budget flashpoint. Major infrastructure deficit." },
  { state:"PA", budget:2.4,  agency:"PA DOC", appro:"Senate Appropriations; House Appropriations", policy:"Senate Judiciary; House Judiciary", chair:"Senate Appropriations: Sen. Scott Martin (R)", notes:"DOC recommended closing SCI Cresson & Pine Grove 2025. Corrections in 'General Government' section." },
  { state:"MI", budget:2.0,  agency:"MDOC", appro:"Senate Corrections Appropriations Sub.; House Corrections Approps Sub.", policy:"Senate Judiciary & Public Safety; House Judiciary", chair:"Senate Corrections Approps Sub.: Sen. Jeremy Moss (D)", notes:"Rare standalone corrections subcommittees in both chambers. Closing prisons as population falls." },
  { state:"OH", budget:1.9,  agency:"ODRC", appro:"Senate Finance; House Finance — Criminal Justice Sub.", policy:"Senate Judiciary; House Criminal Justice", chair:"Senate Finance: Sen. Matt Dolan (R)", notes:"Biennial budget (HB 96 for FY26-27). ODRC in 'General Government' portion." },
  { state:"IL", budget:1.9,  agency:"IDOC", appro:"Senate Appropriations II; House Appropriations — Criminal Justice", policy:"Senate Criminal Law; House Judiciary — Criminal", chair:"Senate Approps II: Majority Democrat (rotates)", notes:"3rd largest state agency. Federal court mandate (Rasho v. Jeffreys) drives mental health spending." },
  { state:"NC", budget:1.5,  agency:"NCDAC", appro:"Senate Appropriations on Justice & Public Safety; House Appropriations J&PS", policy:"Senate Judiciary; House Judiciary I & II", chair:"Senate J&PS Approps: Sen. Danny Britt (R)", notes:"New standalone agency created 2022. ~25% officer vacancy rate. Biennial budget." },
  { state:"MA", budget:1.5,  agency:"MADOC", appro:"Senate Ways & Means; House Ways & Means (Public Safety)", policy:"Senate Judiciary; House Judiciary", chair:"Senate Ways & Means: Sen. Michael Rodrigues (D)", notes:"Highest cost/inmate nationally ($284,976/yr). Lowest incarceration rate (118/100K)." },
  { state:"GA", budget:1.3,  agency:"GDC", appro:"Senate Appropriations (Public Safety Sub.); House Appropriations", policy:"Senate Judiciary; House Judiciary Non-Civil", chair:"Senate Approps Chair: Sen. Blake Tillery (R)", notes:"DOJ 2023 finding of unconstitutional conditions. $600M+ reform investment underway." },
  { state:"WI", budget:1.3,  agency:"WI DOC", appro:"Joint Finance Committee (JFC)", policy:"Senate Judiciary & Public Safety; Assembly Corrections", chair:"JFC Co-Chairs: Sen. Howard Marklein (R) & Rep. Mark Born (R)", notes:"JFC is dominant budget body. Standalone Assembly Corrections Committee does direct oversight." },
  { state:"WA", budget:1.2,  agency:"WADOC", appro:"Senate Ways & Means; House Appropriations", policy:"Senate Law & Justice; House Community Safety, Justice & Reentry", chair:"Senate Ways & Means: Sen. June Robinson (D)", notes:"House committee renamed 2023. HB 1723 (2024) restructured parole oversight." },
  { state:"VA", budget:1.2,  agency:"VADOC", appro:"Senate Finance & Appropriations; House Appropriations (Public Safety Sub.)", policy:"Senate Courts of Justice; House Courts of Justice", chair:"Senate Finance & Appropriations: Sen. Janet Howell (D)", notes:"Biennial budget with annual amendments. Public Safety is major budget category." },
  { state:"NJ", budget:1.2,  agency:"NJDOC", appro:"Senate Budget & Appropriations; Assembly Budget", policy:"Senate Law & Public Safety; Assembly Law & Public Safety", chair:"Senate Budget & Approps: Sen. Paul Sarlo (D)", notes:"Prison population down 45%+ since 2000. Under pressure to close facilities and reinvest savings." },
];

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id:"overview",    label:"📊 Overview"              },
  { id:"types",       label:"🏛️ Facility Types"         },
  { id:"states",      label:"🗺️ By State"               },
  { id:"federal",     label:"💰 Federal Budget"         },
  { id:"fcmte",       label:"🏛 Federal Committees"     },
  { id:"scmte",       label:"🏛 State Committees (Top 15)" },
  { id:"sources",     label:"📚 Sources & Updates"     },
];

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#13132a", border:"1px solid #ef4444", padding:"10px 14px", borderRadius:5, fontFamily:"Georgia,serif" }}>
      <p style={{ color:"#ef4444", fontWeight:700, margin:"0 0 4px" }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:"#eee", margin:"2px 0", fontSize:13 }}>{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

const Badge = ({ text, color }) => (
  <span style={{ background:color+"20", color, border:`1px solid ${color}60`, padding:"2px 10px", borderRadius:4, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{text}</span>
);

const KPI = ({ label, value, sub, accent="#ef4444" }) => (
  <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${accent}30`, borderRadius:8, padding:"14px 18px", flex:"1 1 145px" }}>
    <div style={{ fontSize:22, fontWeight:800, color:accent }}>{value}</div>
    <div style={{ fontSize:11, fontWeight:700, color:"#ccc", textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{sub}</div>}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background:"#0e0e20", border:"1px solid #1e1e3a", borderRadius:10, padding:22, ...style }}>{children}</div>
);

const CardTitle = ({ children }) => (
  <p style={{ margin:"0 0 16px", color:"#aaa", fontSize:12, textTransform:"uppercase", letterSpacing:"2.5px", fontFamily:"Georgia,serif" }}>{children}</p>
);

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n/1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING / ERROR STATES
// ─────────────────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid #1e1e3a", borderTop:"3px solid #ef4444", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:"#666", fontFamily:"Georgia,serif" }}>Loading dashboard data…</p>
    </div>
  );
}

function ErrorScreen({ msg }) {
  return (
    <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <div style={{ background:"#1a0000", border:"1px solid #7f1d1d", borderRadius:10, padding:32, maxWidth:500 }}>
        <h2 style={{ color:"#ef4444", fontFamily:"Georgia,serif" }}>⚠️ Could not load data</h2>
        <p style={{ color:"#aaa", fontFamily:"Georgia,serif", lineHeight:1.6 }}>
          The dashboard could not load <code style={{ background:"#111", padding:"2px 6px", borderRadius:3 }}>data/live_data.json</code>.
        </p>
        <p style={{ color:"#777", fontSize:13, fontFamily:"Georgia,serif" }}>Error: {msg}</p>
        <p style={{ color:"#666", fontSize:12, fontFamily:"Georgia,serif", marginTop:16 }}>
          If running locally, start with <code style={{ background:"#111", padding:"2px 6px", borderRadius:3 }}>npm start</code> from the project root. If deployed, check that the data file is in <code style={{ background:"#111", padding:"2px 6px", borderRadius:3 }}>public/data/live_data.json</code>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data, error } = useData();
  const [tab, setTab] = useState("overview");
  const [stateSort, setStateSort] = useState("budget");
  const [expandedCmte, setExpandedCmte] = useState(null);
  const [expandedState, setExpandedState] = useState(null);
  const [chamberFilter, setChamberFilter] = useState("ALL");

  if (error) return <ErrorScreen msg={error} />;
  if (!data)  return <LoadingScreen />;

  const h = data.headline_stats;
  const sortedStates = [...(data.states || [])]
    .sort((a,b) => b[stateSort] - a[stateSort]);

  const filteredCmtes = chamberFilter === "ALL"
    ? FEDERAL_COMMITTEES
    : FEDERAL_COMMITTEES.filter(c => c.chamber === chamberFilter);

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#e0e0e0", fontFamily:"Georgia,'Times New Roman',serif" }}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
        .tab{background:none;border:none;cursor:pointer;padding:12px 16px;font-family:Georgia,serif;font-size:13px;white-space:nowrap;transition:color .2s}
        .tab:hover{color:#ef4444}
        table{border-collapse:collapse;width:100%;font-size:13px}
        th{padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#ef4444;background:#130010;border-bottom:2px solid #7f1d1d;white-space:nowrap}
        td{padding:9px 14px;border-bottom:1px solid #141424}
        tr:hover td{background:#0d0d1e}
        .sort-btn{background:none;border:1px solid #333;color:#777;padding:5px 12px;border-radius:4px;cursor:pointer;font-family:Georgia,serif;font-size:12px;margin-right:6px;transition:all .2s}
        .sort-btn.on{background:#7f1d1d;border-color:#ef4444;color:#fff}
        .filter-btn{background:none;border:1px solid #333;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-family:Georgia,serif;font-size:12px;margin-right:6px;transition:all .2s}
        .filter-btn.on{background:#1e3a5f;border-color:#3b82f6;color:#93c5fd}
        .cmte-card{background:#0e0e20;border:1px solid #1e1e3a;border-radius:8px;overflow:hidden;cursor:pointer;transition:border-color .2s}
        .cmte-card:hover{border-color:#ef444440}
        .expand{background:#080810;border-top:1px solid #1e1e3a;padding:16px 20px;font-size:13px;line-height:1.6;color:#bbb}
        @media(max-width:768px){.g2,.g3{grid-template-columns:1fr!important}.kpirow{flex-wrap:wrap}}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        background:"linear-gradient(135deg,#130005 0%,#1a0008 40%,#080810 100%)",
        borderBottom:"2px solid #7f1d1d", padding:"28px 32px 22px", position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute",top:0,right:0,width:"40%",height:"100%",
          backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(127,29,29,0.04) 12px,rgba(127,29,29,0.04) 24px)" }}/>
        <div style={{ fontSize:10, letterSpacing:5, color:"#7f1d1d", textTransform:"uppercase", marginBottom:6 }}>
          Live National Data Dashboard · Auto-updated monthly · Last updated: {data._meta?.last_updated || "—"}
        </div>
        <h1 style={{ margin:"0 0 4px", fontSize:"clamp(20px,4vw,36px)", fontWeight:800, color:"#fff", letterSpacing:-1, lineHeight:1.1 }}>
          U.S. Prison & Detention<br/>
          <span style={{ color:"#ef4444" }}>Ecosystem Monitor</span>
        </h1>
        <p style={{ margin:"8px 0 18px", color:"#555", fontSize:13, maxWidth:620, lineHeight:1.6 }}>
          Federal · State · Local · Immigration detention · Populations, budgets & congressional oversight<br/>
          <span style={{ color:"#333" }}>Auto-pulled from BOP & ICE · Annual BJS · Updated {h.data_as_of}</span>
        </p>

        {/* Update status pill */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#001a0a", border:"1px solid #14532d", borderRadius:20, padding:"4px 14px", marginBottom:18 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", display:"inline-block" }}/>
          <span style={{ color:"#4ade80", fontSize:12 }}>
            Data current · Next auto-update: {data._meta?.next_update || "1st of next month"}
          </span>
        </div>

        <div className="kpirow" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <KPI label="Total Facilities"         value={`${(h.total_facilities||0).toLocaleString()}+`} sub="All types, all jurisdictions"              accent="#ef4444"/>
          <KPI label="People Incarcerated"       value={`~${fmt(h.total_incarcerated)}`}               sub="All facility types"                        accent="#f97316"/>
          <KPI label="ICE Detained Now"          value={`${(h.ice_detained_current||0).toLocaleString()}+`} sub={h.ice_detained_note}                  accent="#eab308"/>
          <KPI label="Annual System Cost"        value={`$${h.annual_system_cost_billions}B`}          sub="Federal + State + Local est."              accent="#22c55e"/>
          <KPI label="Federal BOP Budget"        value={`$${h.federal_bop_budget_billions}B`}          sub="FY2025 base (+ OBBBA supplement)"          accent="#3b82f6"/>
          <KPI label="ICE Detention Budget"      value={`$${h.ice_detention_budget_billions}B/yr`}     sub="Post-OBBBA effective rate"                 accent="#8b5cf6"/>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────── */}
      <div style={{ background:"#0b0b18", borderBottom:"1px solid #1e1e3a", padding:"0 32px", display:"flex", overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} className="tab" onClick={() => setTab(t.id)} style={{
            color: tab===t.id ? "#ef4444" : "#555",
            borderBottom: tab===t.id ? "2px solid #ef4444" : "2px solid transparent",
            fontWeight: tab===t.id ? 700 : 400
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:"28px 32px", maxWidth:1400, margin:"0 auto" }}>

        {/* ══ OVERVIEW ══════════════════════════════════════════════ */}
        {tab==="overview" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>System-Wide Overview</h2>
            <p style={{ color:"#555", margin:"0 0 22px", fontSize:13 }}>The United States operates the world's largest carceral system across federal, state, local, and immigration detention authorities.</p>

            {/* Breaking news */}
            {data.breaking_news?.length > 0 && (
              <Card style={{ borderLeft:"4px solid #f97316", marginBottom:24 }}>
                <CardTitle style={{ color:"#f97316" }}>⚡ Recent Developments</CardTitle>
                <div className="g3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                  {data.breaking_news.map(n => (
                    <div key={n.id} style={{ background:"#130a00", border:`1px solid ${n.color}30`, borderLeft:`3px solid ${n.color}`, borderRadius:6, padding:14 }}>
                      <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>{n.date}</div>
                      <div style={{ fontWeight:700, color:"#fed7aa", fontSize:13, marginBottom:6 }}>{n.headline}</div>
                      <div style={{ color:"#888", fontSize:12, lineHeight:1.5 }}>{n.body}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
              <Card>
                <CardTitle>Population by Facility Type</CardTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.facility_types} layout="vertical" margin={{ left:20, right:20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                    <XAxis type="number" tick={{ fill:"#555", fontSize:11 }} tickFormatter={v => (v/1000).toFixed(0)+"K"}/>
                    <YAxis type="category" dataKey="type" tick={{ fill:"#aaa", fontSize:10 }} width={145}/>
                    <Tooltip content={<TT/>}/>
                    <Bar dataKey="population" name="Population" radius={[0,4,4,0]}>
                      {data.facility_types.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle>Annual Budget Distribution — ${h.annual_system_cost_billions}B Total</CardTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data.budget_split} cx="50%" cy="50%" outerRadius={105} dataKey="value"
                      label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} fontSize={10}>
                      {data.budget_split.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Legend formatter={v => <span style={{ color:"#aaa", fontSize:11 }}>{v}</span>}/>
                    <Tooltip formatter={v => `$${v}B`} contentStyle={{ background:"#13132a", border:"1px solid #ef4444", fontFamily:"Georgia" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <CardTitle>Facility Count by Type</CardTitle>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.facility_types} margin={{ left:10, right:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                  <XAxis dataKey="type" tick={{ fill:"#888", fontSize:10 }}/>
                  <YAxis tick={{ fill:"#555", fontSize:11 }}/>
                  <Tooltip content={<TT/>}/>
                  <Bar dataKey="count" name="Facilities" radius={[4,4,0,0]}>
                    {data.facility_types.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ══ FACILITY TYPES ════════════════════════════════════════ */}
        {tab==="types" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>Facility Type Deep Dive</h2>
            <p style={{ color:"#555", margin:"0 0 22px", fontSize:13 }}>Each type is administered by different agencies, funded through different appropriation streams, and governed under different legal frameworks.</p>
            {[
              { type:"State Prisons",         color:"#b91c1c", op:"State Departments of Corrections (50 states)", app:"State General Fund; each state legislature appropriates independently", note:"House people convicted of felonies >1 year. MS highest rate (847/100K); MA lowest (118/100K)." },
              { type:"Federal Prisons (BOP)", color:"#16a34a", op:"Federal Bureau of Prisons (DOJ)",             app:"CJS Appropriations Act — Federal Prison System S&E (acct 15-1060). +$5B OBBBA supplement.", note:"98 facilities from minimum camps to ADX Florence supermax. Federal Prison Oversight Act (2024) mandates DOJ IG annual inspections." },
              { type:"Local Jails",           color:"#dc2626", op:"County Sheriffs / City Governments",          app:"Local property taxes, county general funds. Federal reimbursement for holding federal detainees.", note:"69% of jail population pretrial/unconvicted. 7.9M annual admissions. Population rising in 2024-25." },
              { type:"Immigration (ICE)",     color:"#d97706", op:"U.S. ICE / DHS",                              app:"DHS Appropriations Act (base) + OBBBA reconciliation $45B for new facilities + $29.9B operations.", note:"Record 68K+ detained Dec 2025. ~90% in private facilities (GEO Group, CoreCivic). OBBBA targets 100K bed capacity." },
              { type:"Juvenile Facilities",   color:"#ea580c", op:"State juvenile justice agencies + private",   app:"State juvenile justice appropriations + DOJ OJJDP block grants (JJDPA, Title V)", note:"57% in private facilities. Juvenile detention down 75% from 2000 peak. OJJDP provides federal grants." },
              { type:"Indian Country Jails",  color:"#0891b2", op:"Tribal governments + BIA (DOI)",              app:"Interior Dept. Appropriations — Law Enforcement. Tribal Law and Order Act (TLOA) grants.", note:"80 facilities in 23 states. Chronic underfunding per GAO. BIA operates some directly." },
            ].map(f => {
              const ft = data.facility_types.find(d => d.type === f.type) || {};
              return (
                <div key={f.type} style={{ background:"#0e0e20", border:`1px solid ${f.color}30`, borderLeft:`4px solid ${f.color}`, borderRadius:8, padding:20, marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:14 }}>
                    <div>
                      <h3 style={{ margin:0, color:f.color, fontSize:17 }}>{f.type}</h3>
                      <p style={{ color:"#777", margin:"3px 0 0", fontSize:13 }}>{f.op}</p>
                    </div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {[{l:"Facilities",v:(ft.count||0).toLocaleString()},{l:"Population",v:(ft.population||0).toLocaleString()}].map(m => (
                        <div key={m.l} style={{ textAlign:"center", background:"#08080f", padding:"8px 14px", borderRadius:6, border:"1px solid #1e1e3a" }}>
                          <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{m.v}</div>
                          <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1 }}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>Appropriation Source</div>
                      <div style={{ fontSize:12, color:"#bbb", lineHeight:1.5 }}>{f.app}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>Key Notes</div>
                      <div style={{ fontSize:12, color:"#bbb", lineHeight:1.5 }}>{f.note}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ BY STATE ══════════════════════════════════════════════ */}
        {tab==="states" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>State-by-State Data</h2>
            <p style={{ color:"#555", margin:"0 0 18px", fontSize:13 }}>State prison populations under state jurisdiction. Budgets = corrections appropriations. Rate = per 100K adults. Data from BJS Prisoners 2023 (updated annually).</p>
            <div style={{ marginBottom:18 }}>
              <span style={{ color:"#555", fontSize:12, marginRight:8 }}>Sort by:</span>
              {["population","budget","facilities","rate"].map(s => (
                <button key={s} className={"sort-btn"+(stateSort===s?" on":"")} onClick={() => setStateSort(s)}>
                  {s==="rate"?"Inc. Rate":s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            <Card style={{ marginBottom:24 }}>
              <CardTitle>Top 30 States — {stateSort==="rate"?"Incarceration Rate/100K":stateSort==="budget"?"Corrections Budget ($B)":stateSort==="population"?"Prison Population":"Facility Count"}</CardTitle>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={sortedStates.slice(0,30)} margin={{ left:10, right:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                  <XAxis dataKey="state" tick={{ fill:"#aaa", fontSize:11 }}/>
                  <YAxis tick={{ fill:"#555", fontSize:11 }} tickFormatter={v => stateSort==="budget"?`$${v}B`:stateSort==="rate"?v:v>1000?`${(v/1000).toFixed(0)}K`:v}/>
                  <Tooltip content={<TT/>}/>
                  <Bar dataKey={stateSort} name={stateSort==="budget"?"Budget ($B)":"Population"} fill="#ef4444" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <div style={{ overflowX:"auto" }}>
              <table>
                <thead>
                  <tr>
                    {["State","Est. Prisons","Prison Pop.","Corrections Budget","Rate/100K","Oversight Committees"].map(h=>(
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStates.map((s,i) => (
                    <tr key={s.state}>
                      <td style={{ fontWeight:700, color:"#ef4444" }}>{s.state}</td>
                      <td style={{ color:"#ccc" }}>{s.facilities}</td>
                      <td style={{ color:"#ccc" }}>{s.population.toLocaleString()}</td>
                      <td style={{ color:"#fbbf24" }}>${s.budget}B</td>
                      <td style={{ color:s.rate>700?"#ef4444":s.rate<200?"#22c55e":"#ccc", fontWeight:s.rate>700||s.rate<200?700:400 }}>{s.rate}</td>
                      <td style={{ color:"#555", fontSize:11, maxWidth:280 }}>{STATE_COMMITTEES[s.state] || s.state+" Dept. of Corrections"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ FEDERAL BUDGET ════════════════════════════════════════ */}
        {tab==="federal" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>Federal Budget & Appropriations</h2>
            <p style={{ color:"#555", margin:"0 0 22px", fontSize:13 }}>Federal carceral spending was transformed in 2025 by the "One Big Beautiful Bill Act" (OBBBA, P.L.119-21). The $45B ICE detention construction appropriation alone exceeds the entire BOP annual budget.</p>
            <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
              <Card>
                <CardTitle>Federal Agency Spending (FY2025 Effective, $B)</CardTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    {name:"ICE (OBBBA+base)",val:14.4,fill:"#d97706"},
                    {name:"BOP (base+supp)", val:9.1, fill:"#16a34a"},
                    {name:"CBP Enforcement", val:8.0, fill:"#ea580c"},
                    {name:"USMS Detention",  val:1.5, fill:"#8b5cf6"},
                    {name:"Military/Other",  val:0.6, fill:"#4f46e5"},
                    {name:"BIA/Tribal",      val:0.14,fill:"#0891b2"},
                  ]} layout="vertical" margin={{ left:20, right:30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                    <XAxis type="number" tick={{ fill:"#555", fontSize:11 }} tickFormatter={v=>`$${v}B`}/>
                    <YAxis type="category" dataKey="name" tick={{ fill:"#aaa", fontSize:10 }} width={165}/>
                    <Tooltip content={<TT/>}/>
                    <Bar dataKey="val" name="Budget ($B)" radius={[0,4,4,0]}>
                      {["#d97706","#16a34a","#ea580c","#8b5cf6","#4f46e5","#0891b2"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardTitle>System Budget Split — ${h.annual_system_cost_billions}B</CardTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data.budget_split} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                      label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} fontSize={10}>
                      {data.budget_split.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Legend formatter={v=><span style={{ color:"#aaa", fontSize:11 }}>{v}</span>}/>
                    <Tooltip formatter={v=>`$${v}B`} contentStyle={{ background:"#13132a", border:"1px solid #ef4444", fontFamily:"Georgia" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
            {[
              { title:"Bureau of Prisons — $9.1B base + $5B OBBBA", color:"#16a34a", bill:"Commerce, Justice, Science (CJS) Appropriations Act", acct:"Federal Prison System S&E — Account 15-1060", recent:"OBBBA §100056: $5B over FY2025–2029 ($3B staffing + $2B facilities). Federal Prison Oversight Act (2024) mandates annual DOJ IG inspections of all 98 facilities.", use:"Personnel (35K+ staff), healthcare, programming, food, utilities, private facility transfers" },
              { title:"ICE Detention — $14.4B/yr effective (FY2025+)", color:"#d97706", bill:"DHS Appropriations Act (base) + OBBBA reconciliation (multi-year)", acct:"DHS Enforcement & Removal Operations (ERO) — Custody Operations PPA", recent:"OBBBA: $45B for new detention centers + $29.9B operations over 4 yrs. ICE now largest federal law enforcement agency by budget. 90%+ detainees in private facilities.", use:"Contracts with GEO Group, CoreCivic; intergovernmental agreements with county jails; transportation; ankle monitoring" },
              { title:"U.S. Marshals Service — $1.5B", color:"#8b5cf6", bill:"CJS Appropriations Act", acct:"USMS Salaries & Expenses + Federal Prisoner Detention Trustee Account", recent:"No OBBBA supplement. USMS holds ~56K pretrial federal detainees. Does not operate own facilities.", use:"Per-diem reimbursements to BOP, local jails, and private facilities holding pretrial federal defendants" },
              { title:"BIA Indian Country Jails — ~$140M", color:"#0891b2", bill:"Interior, Environment & Related Agencies Appropriations Act", acct:"BIA Law Enforcement — Indian Country Detention Facilities", recent:"Tribal Law and Order Act (TLOA) supplemental grants. Chronic underfunding per GAO. No OBBBA supplement.", use:"Operations of 80 tribal jails; grants to tribes for self-operated facilities; training and equipment" },
            ].map(f => (
              <div key={f.title} style={{ background:"#0e0e20", borderLeft:`4px solid ${f.color}`, border:`1px solid ${f.color}20`, borderRadius:8, padding:20, marginBottom:14 }}>
                <h3 style={{ margin:"0 0 14px", color:f.color, fontSize:15 }}>{f.title}</h3>
                <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[{l:"Appropriations Bill",v:f.bill},{l:"Budget Account",v:f.acct},{l:"Recent Legislation",v:f.recent},{l:"Primary Use",v:f.use}].map(m=>(
                    <div key={m.l}>
                      <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>{m.l}</div>
                      <div style={{ fontSize:12, color:"#bbb", lineHeight:1.5 }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ FEDERAL COMMITTEES ════════════════════════════════════ */}
        {tab==="fcmte" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>Federal Congressional Oversight Committees</h2>
            <p style={{ color:"#555", margin:"0 0 18px", fontSize:13 }}>Two tracks: <strong style={{ color:"#ccc" }}>Appropriations</strong> (who fund) and <strong style={{ color:"#ccc" }}>Judiciary / Homeland Security</strong> (who oversee policy). Both chambers must act for funding and legislation to pass.</p>
            <div style={{ marginBottom:20 }}>
              {["ALL","SENATE","HOUSE"].map(f => (
                <button key={f} className={"filter-btn"+(chamberFilter===f?" on":"")} onClick={() => setChamberFilter(f)}>
                  {f==="ALL"?"All Chambers":f}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gap:14 }}>
              {filteredCmtes.map((c,i) => (
                <div key={i} className="cmte-card" onClick={() => setExpandedCmte(expandedCmte===i?null:i)}>
                  <div style={{ padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                        <Badge text={c.chamber} color={c.chamber==="SENATE"?"#b91c1c":"#1d4ed8"}/>
                        <Badge text={c.role}     color={c.role==="Appropriator"?"#d97706":"#7c3aed"}/>
                      </div>
                      <h3 style={{ margin:0, color:"#fff", fontSize:15 }}>{c.committee}</h3>
                      <div style={{ color:"#ef4444", fontSize:13, marginTop:3 }}>↳ {c.subcommittee}</div>
                    </div>
                    <div style={{ textAlign:"right", minWidth:200 }}>
                      <div style={{ fontSize:11, color:"#444", textTransform:"uppercase" }}>Chair</div>
                      <div style={{ color:"#ccc", fontSize:13 }}>{c.chair}</div>
                      {c.ranking && <>
                        <div style={{ fontSize:11, color:"#444", textTransform:"uppercase", marginTop:4 }}>Ranking Member</div>
                        <div style={{ color:"#ccc", fontSize:13 }}>{c.ranking}</div>
                      </>}
                    </div>
                  </div>
                  {expandedCmte===i && (
                    <div className="expand">
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                        <div>
                          <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Jurisdiction & Role</div>
                          <div>{c.jurisdiction}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Website</div>
                          <div style={{ color:"#3b82f6" }}>{c.url}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ background:"#07070e", padding:"5px 20px", borderTop:"1px solid #1e1e3a", fontSize:11, color:"#333" }}>
                    Click to {expandedCmte===i?"collapse ▴":"expand ▾"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ STATE COMMITTEES ═══════════════════════════════════════ */}
        {tab==="scmte" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>State Committees — Top 15 by Corrections Budget</h2>
            <p style={{ color:"#555", margin:"0 0 22px", fontSize:13 }}>These 15 states account for ~74% of all state corrections spending. Each has separate appropriations committees (who fund) and policy/judiciary committees (who oversee).</p>
            <Card style={{ marginBottom:24 }}>
              <CardTitle>Top 15 State Corrections Budgets</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={TOP15_COMMITTEE_DETAILS} margin={{ left:10, right:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e"/>
                  <XAxis dataKey="state" tick={{ fill:"#aaa", fontSize:11 }}/>
                  <YAxis tick={{ fill:"#555", fontSize:11 }} tickFormatter={v=>`$${v}B`}/>
                  <Tooltip content={<TT/>}/>
                  <Bar dataKey="budget" name="Budget ($B)" fill="#ef4444" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <div style={{ display:"grid", gap:12 }}>
              {TOP15_COMMITTEE_DETAILS.map((s,i) => (
                <div key={s.state} className="cmte-card" onClick={() => setExpandedState(expandedState===s.state?null:s.state)}>
                  <div style={{ padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:24, fontWeight:800, color:"#ef4444", minWidth:44 }}>#{i+1} {s.state}</span>
                        <Badge text={`$${s.budget}B`} color="#d97706"/>
                        <span style={{ color:"#555", fontSize:12 }}>{s.agency}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#888" }}>
                        <strong style={{ color:"#ef4444" }}>Appropriations: </strong>{s.appro}
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:"#333", flexShrink:0 }}>Click to {expandedState===s.state?"collapse ▴":"expand ▾"}</div>
                  </div>
                  {expandedState===s.state && (
                    <div className="expand">
                      <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                        <div>
                          <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Policy / Oversight Committees</div>
                          <div style={{ marginBottom:12 }}>{s.policy}</div>
                          <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>2025 Leadership</div>
                          <div>{s.chair}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:"#ef4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Key Context & Issues</div>
                          <div>{s.notes}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SOURCES & UPDATES ════════════════════════════════════ */}
        {tab==="sources" && (
          <div>
            <h2 style={{ color:"#ef4444", margin:"0 0 6px", fontSize:20 }}>Data Sources & Update Architecture</h2>
            <p style={{ color:"#555", margin:"0 0 22px", fontSize:13 }}>This dashboard auto-fetches what it can and clearly flags what requires manual updates.</p>

            <div style={{ display:"grid", gap:12, marginBottom:24 }}>
              {[
                { auto:true,  freq:"Monthly auto",  name:"BOP Population",              url:"bop.gov/about/statistics/population_statistics.jsp", coverage:"Total federal inmate count — updated weekly by BOP; pulled by script monthly" },
                { auto:true,  freq:"Monthly auto",  name:"ICE Detention Total",          url:"ice.gov/detain/detention-management",                 coverage:"Current total ICE detainees — updated monthly by ICE" },
                { auto:false, freq:"Annual (fall)",  name:"BJS Prisoners Report",         url:"bjs.ojp.gov",                                         coverage:"State & federal prison pop. by state, demographics — BJS publishes each Oct/Nov" },
                { auto:false, freq:"Annual (fall)",  name:"BJS Jail Inmates Report",      url:"bjs.ojp.gov",                                         coverage:"Local jail populations and admissions — BJS annual publication" },
                { auto:false, freq:"Quarterly",      name:"Vera Institute Prison/Jail",   url:"vera.org/publications",                               coverage:"Fastest state-level tracking. Update live_data.json states[] each quarter" },
                { auto:false, freq:"Annual (spring)","name":"State Corrections Budgets",  url:"usafacts.org + state DOC websites",                   coverage:"Update after state legislative sessions each spring" },
                { auto:false, freq:"As needed",      name:"Breaking News / Context",      url:"live_data.json → breaking_news[]",                    coverage:"Edit directly in live_data.json — add/remove news items" },
                { auto:false, freq:"After elections", name:"Committee Leadership",         url:"committee.senate.gov / committee.house.gov",          coverage:"Update FEDERAL_COMMITTEES in App.js after elections or leadership changes" },
              ].map(s => (
                <div key={s.name} style={{ background:"#0e0e20", border:`1px solid ${s.auto?"#14532d":"#1e1e3a"}`, borderLeft:`4px solid ${s.auto?"#22c55e":"#555"}`, borderRadius:8, padding:16, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                      <Badge text={s.auto?"🤖 Auto-fetched":"✏️ Manual update"} color={s.auto?"#22c55e":"#d97706"}/>
                      <Badge text={s.freq} color="#7c3aed"/>
                    </div>
                    <div style={{ fontWeight:700, color:"#fff", fontSize:14 }}>{s.name}</div>
                    <div style={{ color:"#3b82f6", fontSize:12, marginTop:2 }}>{s.url}</div>
                    <div style={{ color:"#666", fontSize:12, marginTop:4 }}>{s.coverage}</div>
                  </div>
                </div>
              ))}
            </div>

            <Card style={{ borderLeft:"4px solid #22c55e" }}>
              <CardTitle style={{ color:"#4ade80" }}>🔄 How Auto-Updates Work</CardTitle>
              <div className="g3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                {[
                  { n:"1. GitHub Action runs", b:"On the 1st of every month at 8 AM UTC, the file .github/workflows/monthly_update.yml triggers automatically. No action required from you." },
                  { n:"2. Script fetches live data", b:"scripts/prison_data_updater.py fetches BOP population and ICE detention figures from their public pages and updates data/live_data.json." },
                  { n:"3. Vercel auto-deploys", b:"GitHub Actions commits the updated JSON to your repo. Vercel detects the new commit and redeploys the site in ~2 minutes. Your public URL updates automatically." },
                ].map(s => (
                  <div key={s.n} style={{ background:"#001a0a", border:"1px solid #14532d", borderRadius:6, padding:14 }}>
                    <div style={{ fontWeight:700, color:"#4ade80", fontSize:13, marginBottom:6 }}>{s.n}</div>
                    <div style={{ color:"#666", fontSize:12, lineHeight:1.5 }}>{s.b}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ marginTop:40, borderTop:"1px solid #1e1e3a", paddingTop:18, color:"#333", fontSize:11, lineHeight:1.7 }}>
          <strong style={{ color:"#444" }}>Sources:</strong> BJS Prisoners 2023, BJS Jail Inmates 2023, BOP Weekly Stats, ICE FY2025 Detention Mgmt, PPI Following the Money 2026, USAFacts/Census Bureau State Finance 2023, OBBBA (P.L.119-21, July 2025). Congressional committee data from congress.gov, committee.house.gov, committee.senate.gov (119th Congress). All figures approximate. Auto-updated monthly via GitHub Actions. · Last data update: {data._meta?.last_updated} · Next: {data._meta?.next_update}
        </div>
      </div>
    </div>
  );
}
