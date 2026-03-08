import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Inject global styles
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  :root{
    --navy:#080f1e;--navy2:#0d1832;--navy3:#122040;
    --teal:#00c2d1;--teal2:#009baa;
    --gold:#f4a261;--gold2:#e07b3a;
    --white:#e8f0fe;--gray:#7b8faa;
    --success:#2ecc71;--danger:#e74c3c;--purple:#8b5cf6;
    --card:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);
  }
  body{font-family:'DM Sans',sans-serif;background:var(--navy);color:var(--white);min-height:100vh;}
  h1,h2,h3,h4,h5{font-family:'Poppins',sans-serif;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:var(--navy2);}
  ::-webkit-scrollbar-thumb{background:var(--teal2);border-radius:3px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .fade-up{animation:fadeUp 0.35s ease forwards;}
  .fade-in{animation:fadeIn 0.25s ease forwards;}
  .btn{padding:8px 16px;border-radius:9px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;transition:all 0.18s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
  .btn:disabled{opacity:0.5;cursor:not-allowed;}
  .btn-primary{background:var(--teal);color:var(--navy);}
  .btn-primary:hover:not(:disabled){background:var(--teal2);transform:translateY(-1px);}
  .btn-gold{background:var(--gold);color:var(--navy);}
  .btn-gold:hover:not(:disabled){background:var(--gold2);transform:translateY(-1px);}
  .btn-ghost{background:var(--card);border:1px solid var(--border);color:var(--white);}
  .btn-ghost:hover:not(:disabled){background:rgba(255,255,255,0.09);}
  .btn-danger{background:transparent;border:1px solid var(--danger);color:var(--danger);}
  .btn-danger:hover:not(:disabled){background:var(--danger);color:#fff;}
  .btn-purple{background:var(--purple);color:#fff;}
  .btn-purple:hover:not(:disabled){background:#7c3aed;transform:translateY(-1px);}
  .card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;backdrop-filter:blur(8px);}
  input,select,textarea{background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:9px;padding:10px 14px;color:var(--white);font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color 0.2s;}
  input:focus,select:focus,textarea:focus{border-color:var(--teal);background:rgba(0,194,209,0.06);}
  select option{background:var(--navy2);}
  input[type=file]{padding:8px;}
  .badge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block;}
  .badge-teal{background:rgba(0,194,209,0.15);color:var(--teal);border:1px solid rgba(0,194,209,0.25);}
  .badge-gold{background:rgba(244,162,97,0.15);color:var(--gold);border:1px solid rgba(244,162,97,0.25);}
  .badge-red{background:rgba(231,76,60,0.15);color:#e74c3c;border:1px solid rgba(231,76,60,0.25);}
  .badge-green{background:rgba(46,204,113,0.15);color:#2ecc71;border:1px solid rgba(46,204,113,0.25);}
  .badge-purple{background:rgba(139,92,246,0.15);color:var(--purple);border:1px solid rgba(139,92,246,0.25);}
  .toast{position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:12px;font-weight:600;z-index:9999;font-size:14px;max-width:320px;animation:fadeUp 0.3s ease;}
  .toast.success{background:#0f2a1e;border:1px solid var(--success);color:var(--success);}
  .toast.error{background:#2a0f0f;border:1px solid var(--danger);color:var(--danger);}
  .toast.info{background:#0f1e2a;border:1px solid var(--teal);color:var(--teal);}
  @media(max-width:768px){
    .sidebar{position:fixed!important;transform:translateX(-100%);transition:transform 0.3s;z-index:200;}
    .sidebar.open{transform:translateX(0);}
    .main-wrap{margin-left:0!important;}
    .hide-sm{display:none!important;}
    .grid-2{grid-template-columns:1fr!important;}
    .grid-3{grid-template-columns:1fr!important;}
    .grid-4{grid-template-columns:1fr 1fr!important;}
  }
  @media(min-width:769px){.show-sm-only{display:none!important;}}
  .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:199;}
  @media(max-width:768px){.overlay.active{display:block;}}
  table{width:100%;border-collapse:collapse;}
  th,td{padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);}
  th{font-size:12px;color:var(--gray);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;background:var(--navy3);}
  tr:hover td{background:rgba(255,255,255,0.02);}
`;
document.head.appendChild(style);

// ── API setup ─────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: API });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("mca_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return <>{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}</>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("mca_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      background:"linear-gradient(135deg,#080f1e 0%,#0d1832 50%,#122040 100%)",
      padding:"20px",position:"relative",overflow:"hidden"
    }}>
      <div style={{position:"absolute",top:"-15%",right:"-10%",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(0,194,209,0.12) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-20%",left:"-10%",width:"400px",height:"400px",background:"radial-gradient(circle,rgba(244,162,97,0.08) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>

      <div className="card fade-up" style={{width:"100%",maxWidth:"420px",padding:"40px",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{width:"76px",height:"76px",borderRadius:"22px",background:"linear-gradient(135deg,var(--teal),var(--teal2))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"36px",boxShadow:"0 8px 32px rgba(0,194,209,0.3)"}}>🎓</div>
          <h1 style={{fontSize:"22px",fontWeight:800,marginBottom:"4px"}}>GITAM MCA Hub</h1>
          <p style={{color:"var(--gray)",fontSize:"13px"}}>Visakhapatnam Campus &nbsp;•&nbsp; 2025-2026</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          <div>
            <label style={{fontSize:"12px",color:"var(--gray)",marginBottom:"6px",display:"block",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>Username / Roll Number</label>
            <input placeholder="e.g. MCA001 or admin" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} autoFocus/>
          </div>
          <div>
            <label style={{fontSize:"12px",color:"var(--gray)",marginBottom:"6px",display:"block",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()}/>
          </div>
          {error && <div style={{background:"rgba(231,76,60,0.1)",border:"1px solid rgba(231,76,60,0.25)",borderRadius:"9px",padding:"10px 14px",color:"#e74c3c",fontSize:"13px"}}>⚠️ {error}</div>}
          <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{padding:"13px",fontSize:"15px",borderRadius:"11px",justifyContent:"center",marginTop:"4px"}}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </div>

       
      </div>
    </div>
  );
}

// ── FIRST LOGIN ───────────────────────────────────────────────────────────────
function FirstLoginScreen({ user, showToast, onDone }) {
  const [np, setNp] = useState(""); const [cp, setCp] = useState("");
  const handle = async () => {
    if (np.length < 4) { showToast("Min 4 characters", "error"); return; }
    if (np !== cp) { showToast("Passwords don't match", "error"); return; }
    try {
      await api.post("/auth/change-password", { newPassword: np });
      showToast("Password set! Welcome! 🎉", "success");
      onDone();
    } catch { showToast("Failed", "error"); }
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#080f1e,#0d1832)",padding:"20px"}}>
      <div className="card fade-up" style={{width:"100%",maxWidth:"380px",padding:"40px",textAlign:"center"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>🔐</div>
        <h2 style={{marginBottom:"8px"}}>Set Your Password</h2>
        <p style={{color:"var(--gray)",fontSize:"13px",marginBottom:"24px"}}>Welcome {user.name}! Please set a new password to continue.</p>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",textAlign:"left"}}>
          <input type="password" placeholder="New password (min 4 chars)" value={np} onChange={e => setNp(e.target.value)}/>
          <input type="password" placeholder="Confirm password" value={cp} onChange={e => setCp(e.target.value)} onKeyDown={e => e.key==="Enter" && handle()}/>
          <button className="btn btn-primary" onClick={handle} style={{padding:"12px",justifyContent:"center"}}>Set Password & Continue →</button>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV = {
  admin:  ["dashboard","tasks","notes","timetable","notifications","students","staff"],
  cr:     ["dashboard","tasks","notes","timetable","notifications","students"],
  teacher:["dashboard","tasks","notes","timetable","notifications"],
  student:["dashboard","tasks","notes","timetable","notifications","account"],
};
const ICONS = {dashboard:"🏠",tasks:"📋",notes:"📚",timetable:"📅",notifications:"🔔",students:"👥",staff:"👨‍🏫",account:"👤"};
const LABELS = {dashboard:"Dashboard",tasks:"Tasks",notes:"Study Notes",timetable:"Timetable",notifications:"Notifications",students:"Students",staff:"Staff",account:"Account"};

function Sidebar({ user, active, setActive, unread, open, setOpen }) {
  const items = NAV[user.role] || [];
  const roleIcon = {admin:"👑",cr:"🎓",teacher:"👨‍🏫",student:"🧑‍💻"}[user.role];
  return (
    <>
      <div className={`overlay ${open?"active":""}`} onClick={() => setOpen(false)}/>
      <div className={`sidebar ${open?"open":""}`} style={{width:"220px",background:"var(--navy2)",borderRight:"1px solid var(--border)",height:"100vh",position:"fixed",top:0,left:0,display:"flex",flexDirection:"column",overflowY:"auto"}}>
        <div style={{padding:"20px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"26px"}}>🎓</span>
            <div><div style={{fontFamily:"Poppins",fontWeight:800,fontSize:"14px"}}>GITAM MCA</div><div style={{fontSize:"11px",color:"var(--gray)"}}>Vizag Campus</div></div>
          </div>
        </div>
        <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"12px",background:"linear-gradient(135deg,var(--teal),var(--teal2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{roleIcon}</div>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:700,fontSize:"13px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
              <div style={{fontSize:"11px",color:"var(--gray)"}}>{user.roll||user.username} · {user.role.toUpperCase()}</div>
            </div>
          </div>
        </div>
        <nav style={{padding:"10px",flex:1}}>
          {items.map(item => (
            <button key={item} onClick={() => { setActive(item); setOpen(false); }} style={{
              width:"100%",padding:"9px 12px",borderRadius:"10px",border:"none",cursor:"pointer",
              textAlign:"left",display:"flex",alignItems:"center",gap:"9px",marginBottom:"2px",
              transition:"all 0.15s",
              background:active===item?"rgba(0,194,209,0.12)":"transparent",
              color:active===item?"var(--teal)":"var(--gray)",
              fontFamily:"DM Sans",fontWeight:600,fontSize:"13px",
              borderLeft:active===item?"3px solid var(--teal)":"3px solid transparent"
            }}>
              <span>{ICONS[item]}</span>
              <span>{LABELS[item]}</span>
              {item==="notifications" && unread>0 && <span style={{marginLeft:"auto",background:"var(--gold)",color:"var(--navy)",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",fontWeight:800}}>{unread}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"12px",borderTop:"1px solid var(--border)"}}>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="btn btn-danger" style={{width:"100%",justifyContent:"center",fontSize:"13px"}}>🚪 Logout</button>
        </div>
      </div>
    </>
  );
}

// ── HEADER ────────────────────────────────────────────────────────────────────
function Header({ title, onMenu }) {
  const date = new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  return (
    <div style={{padding:"14px 24px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--navy2)",position:"sticky",top:0,zIndex:10}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
        <button className="btn btn-ghost show-sm-only" onClick={onMenu} style={{padding:"8px 10px"}}>☰</button>
        <h2 style={{fontSize:"18px",fontWeight:700}}>{title}</h2>
      </div>
      <div style={{fontSize:"12px",color:"var(--gray)"}} className="hide-sm">{date}</div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ user, tasks, notes, notifications }) {
  const myDone = tasks.filter(t => t.completed_by?.[user.roll]).length;
  const rate = tasks.length ? Math.round(myDone/tasks.length*100) : 0;
  const unread = notifications.filter(n => !n.read).length;
  const subjects = [...new Set(notes.map(n => n.subject))];

  const stats = user.role==="student" ? [
    {label:"Pending Tasks",value:tasks.filter(t=>!t.completed_by?.[user.roll]).length,icon:"📋",color:"var(--gold)"},
    {label:"Notes Available",value:notes.length,icon:"📚",color:"var(--teal)"},
    {label:"Unread Alerts",value:unread,icon:"🔔",color:"var(--purple)"},
    {label:"Completion",value:`${rate}%`,icon:"✅",color:"var(--success)"},
  ] : [
    {label:"Total Tasks",value:tasks.length,icon:"📋",color:"var(--gold)"},
    {label:"Notes Uploaded",value:notes.length,icon:"📚",color:"var(--teal)"},
    {label:"Subjects",value:subjects.length,icon:"📖",color:"var(--purple)"},
    {label:"Notifications",value:notifications.length,icon:"🔔",color:"var(--success)"},
  ];

  return (
    <div style={{padding:"24px"}}>
      <div className="card fade-up" style={{marginBottom:"24px",padding:"28px",background:"linear-gradient(135deg,rgba(0,194,209,0.18),rgba(0,155,170,0.08))",border:"1px solid rgba(0,194,209,0.25)"}}>
        <h2 style={{fontSize:"20px",fontWeight:800,marginBottom:"6px"}}>Welcome back, {user.name.split(" ")[0]}! 👋</h2>
        <p style={{color:"var(--gray)",fontSize:"13px"}}>GITAM University · MCA Department · Visakhapatnam Campus</p>
        {user.roll && <span className="badge badge-teal" style={{marginTop:"10px"}}>{user.roll}</span>}
      </div>

      <div className="grid-4" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
        {stats.map((s,i) => (
          <div key={i} className="card fade-up" style={{animationDelay:`${i*0.06}s`}}>
            <div style={{fontSize:"28px",marginBottom:"10px"}}>{s.icon}</div>
            <div style={{fontSize:"26px",fontWeight:800,color:s.color,fontFamily:"Poppins"}}>{s.value}</div>
            <div style={{fontSize:"12px",color:"var(--gray)",marginTop:"4px"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
        {tasks.length>0 && (
          <div className="card fade-up">
            <h3 style={{marginBottom:"14px",fontSize:"15px"}}>📋 Recent Tasks</h3>
            {tasks.slice(0,4).map(t => (
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"9px",marginBottom:"8px"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:"13px"}}>{t.title}</div>
                  <div style={{fontSize:"11px",color:"var(--gray)"}}>{t.subject} · Due: {t.due_date}</div>
                </div>
                <span className={`badge ${t.priority==="High"?"badge-red":t.priority==="Low"?"badge-green":"badge-gold"}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        )}

        {subjects.length>0 && (
          <div className="card fade-up">
            <h3 style={{marginBottom:"14px",fontSize:"15px"}}>📚 Notes by Subject</h3>
            {subjects.slice(0,5).map(sub => (
              <div key={sub} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"9px",marginBottom:"8px"}}>
                <span style={{fontWeight:600,fontSize:"13px"}}>{sub}</span>
                <span className="badge badge-teal">{notes.filter(n=>n.subject===sub).length} files</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
function TasksSection({ user, tasks, setTasks, showToast }) {
  const [showForm,setShowForm] = useState(false);
  const [filter,setFilter] = useState("all");
  const [form,setForm] = useState({title:"",subject:"",type:"Assignment",description:"",due_date:"",priority:"Medium"});
  const canPost = ["admin","cr","teacher"].includes(user.role);

  const load = useCallback(async () => {
    try { const {data}=await api.get("/tasks"); setTasks(data); } catch {}
  },[setTasks]);

  const post = async () => {
    if (!form.title||!form.subject||!form.due_date) { showToast("Fill all required fields","error"); return; }
    try {
      await api.post("/tasks",{...form,posted_by:user.name,posted_by_id:user.id});
      showToast("Task posted! ✅","success"); setShowForm(false);
      setForm({title:"",subject:"",type:"Assignment",description:"",due_date:"",priority:"Medium"}); load();
    } catch { showToast("Failed to post","error"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this task?")) return;
    try { await api.delete(`/tasks/${id}`); showToast("Deleted","success"); load(); } catch { showToast("Failed","error"); }
  };

  const toggle = async (task) => {
    const done = !task.completed_by?.[user.roll];
    try {
      await api.patch(`/tasks/${task.id}/complete`,{roll:user.roll,done});
      showToast(done?"Marked done! ✅":"Marked pending","info"); load();
    } catch { showToast("Failed","error"); }
  };

  const filters = ["all","Assignment","Lab Work","Project","Quiz","High","Medium","Low"];
  const filtered = filter==="all" ? tasks : tasks.filter(t=>t.type===filter||t.priority===filter);

  return (
    <div style={{padding:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {filters.map(f => (
            <button key={f} onClick={()=>setFilter(f)} className="btn" style={{fontSize:"11px",padding:"5px 11px",background:filter===f?"var(--teal)":"var(--card)",color:filter===f?"var(--navy)":"var(--gray)",border:"1px solid var(--border)"}}>
              {f==="all"?"All":f}
            </button>
          ))}
        </div>
        {canPost && <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>{showForm?"✕ Cancel":"+ Post Task"}</button>}
      </div>

      {showForm && (
        <div className="card fade-up" style={{marginBottom:"20px"}}>
          <h3 style={{marginBottom:"16px",fontSize:"15px"}}>📋 New Task</h3>
          <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <input placeholder="Task title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input placeholder="Subject *" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              {["Assignment","Lab Work","Project","Quiz","Seminar","Other"].map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              {["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}
            </select>
            <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/>
            <textarea placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{resize:"vertical",minHeight:"60px"}}/>
          </div>
          <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
            <button className="btn btn-primary" onClick={post}>Post Task</button>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length===0 && <div style={{textAlign:"center",padding:"60px",color:"var(--gray)"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>📋</div>No tasks found</div>}
      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        {filtered.map(task => {
          const done = task.completed_by?.[user.roll];
          const completedCount = Object.values(task.completed_by||{}).filter(Boolean).length;
          const pct = Math.round(completedCount/55*100);
          return (
            <div key={task.id} className="card fade-up" style={{borderLeft:`4px solid ${task.priority==="High"?"var(--danger)":task.priority==="Low"?"var(--success)":"var(--gold)"}`,opacity:done?0.65:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"6px"}}>
                    <h3 style={{fontSize:"15px",fontWeight:700,textDecoration:done?"line-through":"none"}}>{task.title}</h3>
                    <span className={`badge ${task.priority==="High"?"badge-red":task.priority==="Low"?"badge-green":"badge-gold"}`}>{task.priority}</span>
                    <span className="badge badge-teal">{task.type}</span>
                  </div>
                  <div style={{fontSize:"12px",color:"var(--gray)",marginBottom:"6px"}}>📖 {task.subject} &nbsp;|&nbsp; 📅 Due: {task.due_date} &nbsp;|&nbsp; 👤 {task.posted_by}</div>
                  {task.description && <div style={{fontSize:"13px",opacity:0.8,marginBottom:"8px"}}>{task.description}</div>}
                  {canPost && (
                    <div>
                      <div style={{fontSize:"11px",color:"var(--gray)",marginBottom:"4px"}}>{completedCount}/55 completed ({pct}%)</div>
                      <div style={{height:"4px",background:"var(--border)",borderRadius:"2px",width:"180px"}}>
                        <div style={{height:"100%",background:`linear-gradient(90deg,var(--teal),var(--success))`,borderRadius:"2px",width:`${pct}%`}}/>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:"8px",alignItems:"center",flexShrink:0}}>
                  {user.role==="student" && (
                    <button className={`btn ${done?"btn-ghost":"btn-primary"}`} onClick={()=>toggle(task)} style={{fontSize:"12px",padding:"6px 12px"}}>
                      {done?"✅ Done":"Mark Done"}
                    </button>
                  )}
                  {canPost && <button className="btn btn-danger" onClick={()=>del(task.id)} style={{fontSize:"12px",padding:"6px 10px"}}>🗑</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── NOTES ─────────────────────────────────────────────────────────────────────
function NotesSection({ user, notes, setNotes, showToast }) {
  const [showForm,setShowForm] = useState(false);
  const [subFilter,setSubFilter] = useState("all");
  const [form,setForm] = useState({title:"",subject:"",description:""});
  const [file,setFile] = useState(null);
  const [uploading,setUploading] = useState(false);
  const canUpload = ["admin","cr","teacher"].includes(user.role);

  const load = useCallback(async () => {
    try { const {data}=await api.get("/notes"); setNotes(data); } catch {}
  },[setNotes]);

  const upload = async () => {
    if (!form.title||!form.subject) { showToast("Title and subject are required","error"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      fd.append("uploaded_by",user.name);
      fd.append("uploaded_by_id",user.id);
      if (file) fd.append("file",file);
      await api.post("/notes",fd,{headers:{"Content-Type":"multipart/form-data"}});
      showToast("Notes uploaded! 📚","success");
      setShowForm(false); setForm({title:"",subject:"",description:""}); setFile(null); load();
    } catch { showToast("Upload failed","error"); }
    setUploading(false);
  };

  const del = async (id) => {
    if (!confirm("Delete this note?")) return;
    try { await api.delete(`/notes/${id}`); showToast("Deleted","success"); load(); } catch {}
  };

  const subjects = ["all",...new Set(notes.map(n=>n.subject))];
  const filtered = subFilter==="all" ? notes : notes.filter(n=>n.subject===subFilter);

  const fileIcon = (name) => {
    if (!name) return "📄";
    const ext = name.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📕";
    if (["doc","docx"].includes(ext)) return "📘";
    if (["ppt","pptx"].includes(ext)) return "📙";
    if (["jpg","jpeg","png","gif"].includes(ext)) return "🖼️";
    return "📄";
  };

  return (
    <div style={{padding:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {subjects.map(s => (
            <button key={s} onClick={()=>setSubFilter(s)} className="btn" style={{fontSize:"11px",padding:"5px 11px",background:subFilter===s?"var(--teal)":"var(--card)",color:subFilter===s?"var(--navy)":"var(--gray)",border:"1px solid var(--border)"}}>
              {s==="all"?"All Subjects":s}
            </button>
          ))}
        </div>
        {canUpload && <button className="btn btn-gold" onClick={()=>setShowForm(!showForm)}>{showForm?"✕ Cancel":"📤 Upload Notes"}</button>}
      </div>

      {showForm && (
        <div className="card fade-up" style={{marginBottom:"20px"}}>
          <h3 style={{marginBottom:"16px",fontSize:"15px"}}>📚 Upload Study Material</h3>
          <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <input placeholder="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            <input placeholder="Subject *" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
            <textarea placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{resize:"vertical",minHeight:"60px",gridColumn:"1/-1"}}/>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:"12px",color:"var(--gray)",marginBottom:"6px",display:"block",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>Upload File (PDF, DOC, PPT, Image)</label>
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files[0])}/>
              {file && <div style={{fontSize:"12px",color:"var(--teal)",marginTop:"6px"}}>✅ {file.name} ({(file.size/1024/1024).toFixed(2)} MB)</div>}
            </div>
          </div>
          <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
            <button className="btn btn-gold" onClick={upload} disabled={uploading}>{uploading?"Uploading...":"📤 Upload"}</button>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length===0 && <div style={{textAlign:"center",padding:"60px",color:"var(--gray)"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>📚</div>No notes uploaded yet</div>}
      <div className="grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>
        {filtered.map(note => (
          <div key={note.id} className="card fade-up" style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span className="badge badge-teal">{note.subject}</span>
              {canUpload && <button className="btn btn-danger" onClick={()=>del(note.id)} style={{fontSize:"11px",padding:"3px 8px"}}>🗑</button>}
            </div>
            <div style={{fontSize:"32px"}}>{fileIcon(note.file_name)}</div>
            <h3 style={{fontSize:"14px",fontWeight:700}}>{note.title}</h3>
            {note.description && <p style={{fontSize:"12px",color:"var(--gray)",flex:1}}>{note.description}</p>}
            <div style={{fontSize:"11px",color:"var(--gray)"}}>📤 {note.uploaded_by}</div>
            {note.file_name && <div style={{fontSize:"11px",color:"var(--gray)"}}>{note.file_name}</div>}
            {note.file_url
              ? <a href={note.file_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{fontSize:"12px",justifyContent:"center"}}>📥 Download / View</a>
              : <div style={{fontSize:"11px",color:"var(--gray)",fontStyle:"italic"}}>No file attached</div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function TimetableSection({ user, timetable, setTimetable, showToast }) {
  const [editDay,setEditDay] = useState(null);
  const [slots,setSlots] = useState([]);
  const canEdit = ["admin","cr"].includes(user.role);

  const load = useCallback(async () => {
    try { const {data}=await api.get("/timetable"); setTimetable(data); } catch {}
  },[setTimetable]);

  const startEdit = (day) => {
    const s = timetable[day]||Array.from({length:6},(_,i)=>({period:i+1,subject:"",teacher:"",room:""}));
    setSlots(s.map(x=>({...x}))); setEditDay(day);
  };

  const save = async () => {
    try { await api.put(`/timetable/${editDay}`,{slots}); showToast("Timetable updated! ✅","success"); setEditDay(null); load(); }
    catch { showToast("Failed to save","error"); }
  };

  const PERIOD_TIMES = ["9:00","10:00","11:00","12:00","2:00","3:00"];

  return (
    <div style={{padding:"24px"}}>
      {editDay && (
        <div className="card fade-up" style={{marginBottom:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <h3 style={{fontSize:"15px"}}>✏️ Edit {editDay}</h3>
            <button className="btn btn-ghost" onClick={()=>setEditDay(null)}>✕</button>
          </div>
          {slots.map((slot,i) => (
            <div key={i} style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 1fr",gap:"8px",alignItems:"center",marginBottom:"8px"}}>
              <div style={{fontSize:"12px",color:"var(--gray)",textAlign:"center"}}>
                <div style={{fontWeight:700}}>P{slot.period}</div>
                <div style={{fontSize:"10px"}}>{PERIOD_TIMES[i]}</div>
              </div>
              <input placeholder="Subject" value={slot.subject} onChange={e=>{const s=[...slots];s[i].subject=e.target.value;setSlots(s);}}/>
              <input placeholder="Teacher" value={slot.teacher} onChange={e=>{const s=[...slots];s[i].teacher=e.target.value;setSlots(s);}}/>
              <input placeholder="Room" value={slot.room} onChange={e=>{const s=[...slots];s[i].room=e.target.value;setSlots(s);}}/>
            </div>
          ))}
          <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-ghost" onClick={()=>setEditDay(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{overflowX:"auto"}}>
        <table style={{minWidth:"700px"}}>
          <thead>
            <tr>
              <th style={{width:"100px"}}>Day</th>
              {[1,2,3,4,5,6].map(p=><th key={p} style={{textAlign:"center"}}>P{p}<br/><span style={{fontWeight:400,fontSize:"10px"}}>{PERIOD_TIMES[p-1]}</span></th>)}
              {canEdit && <th/>}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day,di) => (
              <tr key={day} style={{background:di%2===0?"var(--card)":"transparent"}}>
                <td style={{fontWeight:700,fontSize:"13px",color:day==="Saturday"?"var(--gold)":"var(--white)"}}>{day}</td>
                {[1,2,3,4,5,6].map(p => {
                  const slot=(timetable[day]||[]).find(s=>s.period===p);
                  return (
                    <td key={p} style={{textAlign:"center",padding:"12px 8px"}}>
                      {slot?.subject ? (
                        <div>
                          <div style={{fontSize:"12px",fontWeight:700,color:"var(--teal)"}}>{slot.subject}</div>
                          <div style={{fontSize:"10px",color:"var(--gray)"}}>{slot.teacher}</div>
                          {slot.room && <div style={{fontSize:"10px",color:"var(--gray)"}}>{slot.room}</div>}
                        </div>
                      ) : <span style={{color:"var(--border)",fontSize:"14px"}}>–</span>}
                    </td>
                  );
                })}
                {canEdit && <td><button className="btn btn-ghost" onClick={()=>startEdit(day)} style={{fontSize:"11px",padding:"4px 10px"}}>✏️</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function NotificationsSection({ user, notifications, setNotifications, showToast }) {
  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState({message:"",type:"info",target_role:"all"});
  const canPost = ["admin","cr","teacher"].includes(user.role);

  const load = useCallback(async () => {
    try { const {data}=await api.get("/notifications"); setNotifications(data); } catch {}
  },[setNotifications]);

  const post = async () => {
    if (!form.message) { showToast("Enter a message","error"); return; }
    try {
      await api.post("/notifications",{...form,created_by:user.name});
      showToast("Notification sent! 🔔","success"); setShowForm(false);
      setForm({message:"",type:"info",target_role:"all"}); load();
    } catch { showToast("Failed","error"); }
  };

  const markRead = async (id) => {
    try { await api.patch(`/notifications/${id}/read`,{user_id:user.id}); load(); } catch {}
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n=>!n.read);
    await Promise.all(unread.map(n=>api.patch(`/notifications/${n.id}/read`,{user_id:user.id}).catch(()=>{})));
    load();
  };

  const tColors = {info:"var(--teal)",warning:"var(--gold)",success:"var(--success)",urgent:"var(--danger)"};
  const tIcons = {info:"ℹ️",warning:"⚠️",success:"✅",urgent:"🚨"};

  const unreadCount = notifications.filter(n=>!n.read).length;

  return (
    <div style={{padding:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{fontSize:"13px",color:"var(--gray)"}}>{unreadCount} unread</div>
          {unreadCount>0 && <button className="btn btn-ghost" onClick={markAllRead} style={{fontSize:"12px",padding:"5px 12px"}}>Mark all read</button>}
        </div>
        {canPost && <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>{showForm?"✕ Cancel":"🔔 Send Notification"}</button>}
      </div>

      {showForm && (
        <div className="card fade-up" style={{marginBottom:"20px"}}>
          <h3 style={{marginBottom:"14px",fontSize:"15px"}}>🔔 New Notification</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <textarea placeholder="Notification message *" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} style={{minHeight:"80px",resize:"vertical"}}/>
            <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                {["info","warning","success","urgent"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
              <select value={form.target_role} onChange={e=>setForm({...form,target_role:e.target.value})}>
                <option value="all">Everyone</option>
                <option value="student">Students only</option>
                <option value="teacher">Teachers only</option>
              </select>
            </div>
          </div>
          <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
            <button className="btn btn-primary" onClick={post}>Send</button>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {notifications.length===0 && <div style={{textAlign:"center",padding:"60px",color:"var(--gray)"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>🔔</div>No notifications yet</div>}
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {notifications.map(n => (
          <div key={n.id} className="card fade-up" style={{borderLeft:`4px solid ${tColors[n.type]||"var(--teal)"}`,opacity:n.read?0.55:1,transition:"opacity 0.3s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"4px"}}>
                  <span>{tIcons[n.type]||"ℹ️"}</span>
                  <span style={{fontWeight:600,fontSize:"14px"}}>{n.message}</span>
                  {!n.read && <span className="badge badge-teal" style={{fontSize:"10px"}}>NEW</span>}
                </div>
                <div style={{fontSize:"11px",color:"var(--gray)"}}>👤 {n.created_by} &nbsp;|&nbsp; 🕐 {new Date(n.created_at).toLocaleString("en-IN")}</div>
              </div>
              {!n.read && <button className="btn btn-ghost" onClick={()=>markRead(n.id)} style={{fontSize:"11px",padding:"4px 10px",flexShrink:0}}>Read</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STUDENTS ROSTER ───────────────────────────────────────────────────────────
function StudentsSection({ user, tasks, showToast }) {
  const [students,setStudents] = useState([]);
  const [search,setSearch] = useState("");

  useEffect(() => { api.get("/users/students").then(({data})=>setStudents(data)).catch(()=>{}); },[]);

  const reset = async (s) => {
    if (!confirm(`Reset ${s.name}'s password to roll number?`)) return;
    try { await api.patch(`/users/${s.id}/reset-password`,{newPassword:s.roll}); showToast(`Reset to ${s.roll}`,"success"); }
    catch { showToast("Failed","error"); }
  };

  const filtered = students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.roll.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{padding:"24px"}}>
      <div style={{marginBottom:"16px",display:"flex",gap:"10px",alignItems:"center"}}>
        <input placeholder="🔍 Search by name or roll number..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <span style={{fontSize:"13px",color:"var(--gray)",whiteSpace:"nowrap"}}>{filtered.length} students</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {filtered.map(s => {
          const done = tasks.filter(t=>t.completed_by?.[s.roll]).length;
          const rate = tasks.length ? Math.round(done/tasks.length*100) : 0;
          return (
            <div key={s.id} className="card" style={{padding:"12px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"10px",background:"linear-gradient(135deg,var(--teal),var(--teal2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",fontWeight:800,color:"var(--navy)",flexShrink:0}}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:"13px"}}>{s.name}</div>
                    <div style={{fontSize:"11px",color:"var(--gray)"}}>{s.roll}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"13px",fontWeight:700,color:rate>70?"var(--success)":rate>40?"var(--gold)":"var(--danger)"}}>{rate}%</div>
                    <div style={{fontSize:"10px",color:"var(--gray)"}}>{done}/{tasks.length} tasks</div>
                  </div>
                  {["admin","cr"].includes(user.role) && (
                    <button className="btn btn-ghost" onClick={()=>reset(s)} style={{fontSize:"11px",padding:"4px 10px"}}>🔑 Reset</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ACCOUNT ───────────────────────────────────────────────────────────────────
function AccountSection({ user, tasks, showToast }) {
  const [np,setNp] = useState(""); const [cp,setCp] = useState("");
  const done = tasks.filter(t=>t.completed_by?.[user.roll]).length;
  const rate = tasks.length ? Math.round(done/tasks.length*100) : 0;

  const change = async () => {
    if (np.length<4) { showToast("Min 4 characters","error"); return; }
    if (np!==cp) { showToast("Passwords don't match","error"); return; }
    try { await api.post("/auth/change-password",{newPassword:np}); showToast("Password updated! ✅","success"); setNp(""); setCp(""); }
    catch { showToast("Failed","error"); }
  };

  return (
    <div style={{padding:"24px"}}>
      <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
        <div className="card fade-up">
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{width:"72px",height:"72px",borderRadius:"20px",background:"linear-gradient(135deg,var(--teal),var(--teal2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",margin:"0 auto 16px",boxShadow:"0 8px 24px rgba(0,194,209,0.25)"}}>🧑‍💻</div>
            <h3 style={{fontSize:"18px",fontWeight:700}}>{user.name}</h3>
            <p style={{color:"var(--gray)",fontSize:"13px",marginTop:"4px"}}>{user.roll}</p>
            <span className="badge badge-teal" style={{marginTop:"10px"}}>MCA Student · GITAM Vizag</span>
          </div>
          <div style={{borderTop:"1px solid var(--border)",paddingTop:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
              <span style={{fontSize:"13px",color:"var(--gray)"}}>Tasks Completed</span>
              <span style={{fontWeight:700,color:"var(--success)"}}>{done}/{tasks.length}</span>
            </div>
            <div style={{height:"8px",background:"var(--border)",borderRadius:"4px"}}>
              <div style={{height:"100%",background:"linear-gradient(90deg,var(--teal),var(--success))",borderRadius:"4px",width:`${rate}%`,transition:"width 0.6s"}}/>
            </div>
            <div style={{textAlign:"center",marginTop:"8px",fontSize:"13px",color:"var(--gray)"}}>{rate}% completion rate</div>
          </div>
        </div>

        <div className="card fade-up" style={{animationDelay:"0.1s"}}>
          <h3 style={{marginBottom:"16px",fontSize:"15px"}}>🔐 Change Password</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <input type="password" placeholder="New password (min 4 chars)" value={np} onChange={e=>setNp(e.target.value)}/>
            <input type="password" placeholder="Confirm new password" value={cp} onChange={e=>setCp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&change()}/>
            <button className="btn btn-primary" onClick={change} style={{justifyContent:"center",padding:"11px"}}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STAFF MANAGEMENT ──────────────────────────────────────────────────────────
function StaffSection({ user, showToast }) {
  const [staff,setStaff] = useState([]);
  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState({name:"",username:"",password:"",role:"teacher",subject:""});

  const load = () => api.get("/users").then(({data})=>setStaff(data.filter(u=>u.role!=="student"))).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const add = async () => {
    if (!form.name||!form.username||!form.password) { showToast("Fill all fields","error"); return; }
    try { await api.post("/users",form); showToast("Staff added! ✅","success"); setShowForm(false); setForm({name:"",username:"",password:"",role:"teacher",subject:""}); load(); }
    catch (err) { showToast(err.response?.data?.error||"Failed","error"); }
  };

  const del = async (id) => {
    if (!confirm("Remove this staff member?")) return;
    try { await api.delete(`/users/${id}`); showToast("Removed","success"); load(); } catch { showToast("Failed","error"); }
  };

  const rc = {admin:"var(--danger)",cr:"var(--gold)",teacher:"var(--teal)"};

  return (
    <div style={{padding:"24px"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"18px"}}>
        <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>{showForm?"✕ Cancel":"+ Add Staff"}</button>
      </div>

      {showForm && (
        <div className="card fade-up" style={{marginBottom:"20px"}}>
          <h3 style={{marginBottom:"14px",fontSize:"15px"}}>👨‍🏫 Add Staff Member</h3>
          <div className="grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <input placeholder="Full name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <input placeholder="Username *" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>
            <input type="password" placeholder="Password *" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="teacher">Teacher</option><option value="cr">CR</option></select>
            <input placeholder="Subject (for teachers)" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} style={{gridColumn:"1/-1"}}/>
          </div>
          <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
            <button className="btn btn-primary" onClick={add}>Add Staff</button>
            <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {staff.map(s => (
          <div key={s.id} className="card" style={{padding:"14px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <div style={{width:"40px",height:"40px",borderRadius:"12px",background:`${rc[s.role]}18`,border:`1px solid ${rc[s.role]}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>
                  {s.role==="admin"?"👑":s.role==="cr"?"🎓":"👨‍🏫"}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:"14px"}}>{s.name}</div>
                  <div style={{fontSize:"12px",color:"var(--gray)"}}>{s.username}{s.subject&&` · ${s.subject}`}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span className="badge" style={{background:`${rc[s.role]}18`,color:rc[s.role],border:`1px solid ${rc[s.role]}35`}}>{s.role.toUpperCase()}</span>
                {s.role!=="admin" && <button className="btn btn-danger" onClick={()=>del(s.id)} style={{fontSize:"11px",padding:"4px 10px"}}>🗑</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser] = useState(null);
  const [active,setActive] = useState("dashboard");
  const [tasks,setTasks] = useState([]);
  const [notes,setNotes] = useState([]);
  const [timetable,setTimetable] = useState({});
  const [notifications,setNotifications] = useState([]);
  const [toasts,setToasts] = useState([]);
  const [sidebarOpen,setSidebarOpen] = useState(false);

  const showToast = useCallback((msg,type="info") => {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  },[]);

  const loadAll = useCallback(async () => {
    try {
      const [t,n,tt,notifs] = await Promise.all([api.get("/tasks"),api.get("/notes"),api.get("/timetable"),api.get("/notifications")]);
      setTasks(t.data); setNotes(n.data); setTimetable(tt.data); setNotifications(notifs.data);
    } catch {}
  },[]);

  useEffect(() => {
    const token = localStorage.getItem("mca_token");
    const saved = localStorage.getItem("mca_user");
    if (token && saved) { try { setUser(JSON.parse(saved)); } catch {} }
  },[]);

  useEffect(() => {
    if (user) { loadAll(); const iv=setInterval(loadAll,30000); return ()=>clearInterval(iv); }
  },[user,loadAll]);

  const handleLogin = (u) => { localStorage.setItem("mca_user",JSON.stringify(u)); setUser(u); };

  if (!user) return <><LoginPage onLogin={handleLogin}/><Toast toasts={toasts}/></>;

  if (user.firstLogin && user.role==="teacher") return (
    <>
      <FirstLoginScreen user={user} showToast={showToast} onDone={()=>{
        const u={...user,firstLogin:false}; setUser(u); localStorage.setItem("mca_user",JSON.stringify(u)); loadAll();
      }}/>
      <Toast toasts={toasts}/>
    </>
  );

  const unread = notifications.filter(n=>!n.read).length;
  const TITLES = {dashboard:"Dashboard",tasks:"Tasks",notes:"Study Notes",timetable:"Timetable",notifications:"Notifications",students:"Student Roster",staff:"Staff Management",account:"My Account"};

  const PAGES = {
    dashboard:     <Dashboard user={user} tasks={tasks} notes={notes} notifications={notifications}/>,
    tasks:         <TasksSection user={user} tasks={tasks} setTasks={setTasks} showToast={showToast}/>,
    notes:         <NotesSection user={user} notes={notes} setNotes={setNotes} showToast={showToast}/>,
    timetable:     <TimetableSection user={user} timetable={timetable} setTimetable={setTimetable} showToast={showToast}/>,
    notifications: <NotificationsSection user={user} notifications={notifications} setNotifications={setNotifications} showToast={showToast}/>,
    students:      <StudentsSection user={user} tasks={tasks} showToast={showToast}/>,
    staff:         <StaffSection user={user} showToast={showToast}/>,
    account:       <AccountSection user={user} tasks={tasks} showToast={showToast}/>,
  };

  return (
    <>
      <div style={{display:"flex",minHeight:"100vh"}}>
        <Sidebar user={user} active={active} setActive={setActive} unread={unread} open={sidebarOpen} setOpen={setSidebarOpen}/>
        <div className="main-wrap" style={{marginLeft:"220px",flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <Header title={TITLES[active]} onMenu={()=>setSidebarOpen(true)}/>
          <div style={{flex:1,overflowY:"auto"}}>{PAGES[active]}</div>
        </div>
      </div>
      <Toast toasts={toasts}/>
    </>
  );
}
