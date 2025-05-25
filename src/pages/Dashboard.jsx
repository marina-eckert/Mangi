import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Header  from '../components/Header';
import Sidebar from '../components/Sidebar';

import avatar1 from '../assets/images/avatar1.jpg';
import avatar2 from '../assets/images/avatar2.jpg';
import avatar3 from '../assets/images/avatar3.jpg';
import { MdAccountTree } from 'react-icons/md';
import { FiFolder, FiFolderPlus } from 'react-icons/fi';
import logo from '../assets/images/logo-small.png';

import '../assets/css/style.css';          // keep your existing rules


import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

/* ——— tiny helpers ——— */
const todayISO = () => new Date().toISOString().substring(0, 10);
const tempId   = () => `temp-${Date.now()}-${Math.random()}`;

export default function Dashboard() {
  /* ---------------- state & effects (unchanged fetch logic) ---------------- */
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [criticalActivities, setCriticalActivities] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  /* modal / invite state (kept from your original file) */
  const [modalOpen,     setModalOpen]     = useState(false);
  const [currentCard,   setCurrentCard]   = useState(null);
  const [formData,      setFormData]      = useState({});
  const [inviteVisible, setInviteVisible] = useState(false);
  const inviteInputRef  = useRef(null);

  /* menus & subtasks */
  const [openMenus,     setOpenMenus]     = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const username = localStorage.getItem('username') || 'Guest';

  /* --------------- FETCH PROJECTS + TASKS --------------- */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        /* 1️⃣ projects */
        const pRes = await fetch('http://localhost:3000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!pRes.ok) throw new Error('Failed to load projects');
        const pData = await pRes.json();
        setProjects(pData);

        /* 2️⃣ tasks per project */
        const tasksByProject = [];
        await Promise.all(
          pData.map(async (p) => {
            const tRes = await fetch(
              `http://localhost:3000/api/projects/${p._id}/tasks`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const tData = tRes.ok ? await tRes.json() : [];
            tasksByProject.push({ projectId: p._id, tasks: tData });
          })
        );
        setTasks(tasksByProject);
      } catch (e) {
        setError(e.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();

    /* click-outside handler for invite form */
    const closeOnOutside = (e) => {
      if (inviteInputRef.current && !inviteInputRef.current.contains(e.target))
        setInviteVisible(false);
    };
    document.addEventListener('click', closeOnOutside);
    return () => document.removeEventListener('click', closeOnOutside);
  }, []);

  + // ——————— compute criticalActivities from tasks ———————
 useEffect(() => {
   // flatten leaf tasks
   function flattenLeafTasks(tasks) {
     const leaves = [];
     function walk(list) {
       list.forEach(t => {
         if (!t.subtasks || t.subtasks.length === 0) {
           leaves.push({
             id: t._id,
             duration: (new Date(t.endDate) - new Date(t.startDate)) / (1000*60*60*24),
             dependencies: t.dependencies || []
           });
         } else walk(t.subtasks);
       });
    }
     walk(tasks);
     return leaves;
   }

   // topological sort
   function topologicalSort(acts) {
     const map = Object.fromEntries(acts.map(a => [a.id, a]));
     const visited = new Set(), out = [];
     function visit(a) {
       if (visited.has(a.id)) return;
       visited.add(a.id);
       a.dependencies.forEach(dep => map[dep] && visit(map[dep]));
       out.push(a);
     }
     acts.forEach(visit);
     return out;
   }

  // calculate ES, EF, LS, LF, slack, isCritical
   function calculateCriticalPath(acts) {
     const CP = {};
     acts.forEach(a => CP[a.id] = { ...a, ES:0, EF:0, LS:Infinity, LF:Infinity });
     const sorted = topologicalSort(acts);
     sorted.forEach(a => {
       const { ES, duration } = a.dependencies.length === 0
         ? { ES:0, duration:a.duration }
         : ((maxEF) => ({ ES:maxEF, duration: maxEF + a.duration }))( Math.max(...a.dependencies.map(d=>CP[d].EF)) );
       CP[a.id].ES = ES; CP[a.id].EF = ES + a.duration;
     });
     const maxEF = Math.max(...sorted.map(a=>CP[a.id].EF));
     // backward pass
     sorted.reverse().forEach(a => {
       if (acts.every(b => !b.dependencies.includes(a.id))) {
         CP[a.id].LF = maxEF;
         CP[a.id].LS = maxEF - a.duration;
       } else {
         const minLS = Math.min(...acts.filter(b=>b.dependencies.includes(a.id)).map(b=>CP[b.id].LS));
         CP[a.id].LF = minLS;
         CP[a.id].LS = minLS - a.duration;
       }
     });
     // slack + isCritical
     Object.values(CP).forEach(a => {
       a.slack = a.LS - a.ES;
       a.isCritical = (a.slack === 0);
     });
     return Object.values(CP);
   }

   // only run if tasks have come in
   if (tasks.length) {
     const flat = tasks.flatMap(g => g.tasks);
     const leafs = flattenLeafTasks(flat);
     setCriticalActivities(calculateCriticalPath(leafs));
   }
 }, [tasks]);

 const criticalLookup = useMemo(
  () => Object.fromEntries(criticalActivities.map(act => [act.id, act.isCritical])),
  [criticalActivities]
);
const allTasks = tasks.flatMap(g => g.tasks);
// flatten all tasks and tag them with isCritical
const allTasksCrit = tasks.flatMap(g => g.tasks);
const urgentTasksCrit = useMemo(() => {
  return allTasks
    .filter(t => criticalLookup[t._id] || t.priority === 'High')
    .map(t => ({
      ...t,
      isCritical: Boolean(criticalLookup[t._id]),
    }))
    .sort((a, b) => {
      if (a.isCritical !== b.isCritical) return b.isCritical - a.isCritical;
      const P = { High: 3, Medium: 2, Low: 1 };
      return (P[b.priority]||0) - (P[a.priority]||0);
    });
}, [allTasks, criticalLookup]);

  /* ----------------- UI helpers ----------------- */
  const toggleMenu = (id) =>
    setOpenMenus((prev) => ({ [id]: !prev[id] }));     // single open menu

  const toggleSubtasks = (id) =>
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value.trim();
    if (!email) return alert('Enter an email');
    alert(`Invitation sent to ${email}`);
    e.target.reset();
    setInviteVisible(false);
  };

  /* ---------------- memoised cards ---------------- */
  const projectCards = useMemo(
    () =>
      projects.map((p) => (
        <ProjectCard
          key={p._id}
          project={p}
          menuOpen={openMenus[`p-${p._id}`]}
          onToggleMenu={() => toggleMenu(`p-${p._id}`)}
          openSettings={() => openSettingsModal({ ...p, type: 'project' })}
        />
      )),
    [projects, openMenus]
  );

  const taskCards = useMemo(
    () =>
      tasks.flatMap(({ tasks }) => tasks).map((t) => (
        <TaskCard
          key={t._id}
          task={t}
          expanded={expandedTasks[t._id]}
          menuOpen={openMenus[`t-${t._id}`]}
          onToggleMenu={() => toggleMenu(`t-${t._id}`)}
          onToggleExpand={() => toggleSubtasks(t._id)}
          openSettings={() => openSettingsModal({ ...t, type: 'task' })}
          removeTask={() =>
            setTasks((prev) =>
              prev.map((grp) => ({
                ...grp,
                tasks: grp.tasks.filter((tk) => tk._id !== t._id),
              }))
            )
          }
        />
      )),
    [tasks, openMenus, expandedTasks]
  );
  // flatten all tasks into one array


// assume you computed criticalActivities already (from your CPM logic)
const critMap = Object.fromEntries(
  criticalActivities.map(c => [c.id, c.isCritical])
);

// define a priority ranking (higher = more urgent)
const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };

const urgentTasks = allTasks
  // only show tasks you want — e.g. those flagged “High” or critical
  .filter(t => critMap[t._id] || t.priority === 'High')
  // sort: critical first, then by priority value
  .sort((a, b) => {
    const aCrit = critMap[a._id] ? 1 : 0;
    const bCrit = critMap[b._id] ? 1 : 0;
    if (aCrit !== bCrit) return bCrit - aCrit;              // critical → top
    return (PRIORITY_ORDER[b.priority] || 0)              // then by priority
         - (PRIORITY_ORDER[a.priority] || 0);
  });
  /* ------------------ render ------------------ */
  return (
    <div className="dashboard">
      {/* <Header /> */}
      <Sidebar />

      <main style={{ marginLeft: 80, padding: '40px 60px' }}>
       <div style={{ width: 80, height: 40 }} />
        {/* welcome header */}
        <div className="flex-between" style={{ marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, paddingLeft: 6, }}>Welcome, {username}!</h1>
            <p style={{ color: '#0f1a43', 
                        //add left padding to align with the header
                        paddingLeft: 10,
                        paddingTop: 9,
                       


            }}>  Here is your agenda for today</p>
          </div>
          <input
            type="search"
            placeholder="Search"
            style={{
              width: 865,
              height: 44,
              borderRadius: 10,
              background: '#9f9e9e30',
              
              fontSize: 16,
              color: '#6b7280',
              border: '0px solid #d1d5db',
              paddingInline: 16,
            }}
          />
        </div>
            <div style={{ width: 80, height: 40 }} />
        {/* grid */}
        <div className="grid-3">
          {/* column 1 */}
          <section>
            <CalendarCard />
            <div className="card" style={{ marginTop: 24 }}>
              <h3 className="card-title">Project directory</h3>
              {loading ? 'Loading…' : error ? error : projectCards}
              <Link to="/create_project">
                <button className="btn" style={{ width: '100%', marginTop: 12 }}>
                  ＋ New Project
                </button>
              </Link>
            </div>
          </section>
          

          {/* column 2 */}
          <section>
            <UrgentTasksCard tasks={urgentTasksCrit} />
            <div className="card" style={{ marginTop: 24 }}>
              <h3 className="card-title">New comments</h3>
              <CommentCard author="Elon S." text="Find my keynote attached in the…" />
              <CommentCard author="Dana R." text="I've added some new data. Let’s…" />
            </div>
          </section>

          {/* column 3 */}
          <section>
            <div className="card">
              <h3 className="card-title">Tasks</h3>
              {loading ? 'Loading…' : error ? error : taskCards}
              <Link to="/create_task">
                <button className="btn" style={{ width: '100%', marginTop: 12 }}>
                  ＋ New Task
                </button>
              </Link>
            </div>

            {/* invite card */}
            <InviteCard
              inviteVisible={inviteVisible}
              setInviteVisible={setInviteVisible}
              inviteInputRef={inviteInputRef}
              handleInviteSubmit={handleInviteSubmit}
            />
          </section>
        </div>
      </main>

      {/* modal*/}
      {modalOpen && (
        <SettingsModal
          card={currentCard}
          formData={formData}
          setFormData={setFormData}
          close={() => setModalOpen(false)}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}

/* ———— sub-comps ———— */

function CalendarCard() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="card">
      <Calendar
        onChange={setDate}
        value={date}
      />
    </div>
  );
}

function UrgentTasksCard({ tasks }) {
  return (
    <div className="card">
      <h3 className="card-title">Urgent tasks</h3>
      {tasks.length === 0 ? (
        <p style={{ padding: '1rem', color: '#6b7280' }}>No urgent tasks</p>
      ) : tasks.map(task => (
        <div
          key={task._id}
          className="flex-between"
          style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div className="flex" style={{ paddingLeft: 10, gap: 18, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={task.isCritical}
              readOnly
              style={{
      
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',

      
      width: 16,
      height: 16,
      border: '0.5px solid #ccc',
      borderRadius: '50%',
      

      /* fill when “checked” */
      backgroundColor: task.isCritical ? 'transparent' : 'transparent',

      /* pointer */
      cursor: 'pointer',
    }}
            />
            <span>{task.title}</span>
          </div>
          <span
            className="badge-today"
            style={{ color: task.isCritical ? 'red' : undefined }}
          >
            {task.isCritical ? 'Critical' : task.priority || '—'}
          </span>
        </div>
      ))}
    </div>
  );
}



function ProjectCard({ project, menuOpen, onToggleMenu, openSettings }) {
  return (
    <div className="flex-between" style={{ height: 40 ,paddingBlock: 0, borderBottom: '1px solid rgba(0, 0, 0, 0.1)'}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiFolder size={20} color="#0f1a43" />
        <span>{project.title}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <span onClick={onToggleMenu} style={{ cursor: 'pointer' }}>⋮</span>
        {menuOpen && (
          <div className="card-menu" style={{ position: 'absolute', right: 0, top: 24 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); openSettings(); }}>
              Settings
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, expanded, menuOpen, onToggleMenu, onToggleExpand, openSettings, removeTask }) {
  return (
    <div className="flex-between" style={{ paddingBlock: 10 }}>
      <div style={{ paddingleft: 10, display: 'flex', alignItems: 'initial', gap: 10 }}>
        <MdAccountTree size={20} color="#0f1a43" />
        <span>{task.title}</span>
      </div>
      <span style={{ cursor: 'pointer' }} onClick={onToggleExpand}>
        {task.projectId}
      </span>
      <div style={{ position: 'relative' }}>
        <span onClick={onToggleMenu} style={{ cursor: 'pointer' }}>⋮</span>
        {menuOpen && (
          <div className="card-menu" style={{ position: 'absolute', right: 0, top: 24 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); openSettings(); }}>
              Settings
            </a>
            <a href="#" style={{ color: '#e74c3c' }} onClick={(e) => { e.preventDefault(); removeTask(); }}>
              Remove
            </a>
          </div>
        )}
      </div>
      {expanded && (
        <ul style={{ marginTop: 6, marginLeft: 12 }}>
          <li>Subtask 1</li><li>Subtask 2</li><li>Subtask 3</li>
        </ul>
      )}
    </div>
  );
}

function CommentCard({ author, text }) {
  return (
    <div className="flex" style={{ gap: 12, background: '#f9fafb', padding: 12, borderRadius: 8, marginBlockEnd: 8 }}>
      <img src={avatar1} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
      <div style={{ fontSize: 14 }}>
        <strong>{author}</strong>
        <p style={{ color: '#6b7280' }}>{text}</p>
      </div>
    </div>
  );
}

function InviteCard({ inviteVisible, setInviteVisible, inviteInputRef, handleInviteSubmit }) {
  return (
    <div className="card" style={{ marginTop: 24, position: 'relative' }}>
      <div className="flex" style={{ alignItems: 'center', gap: 12 }}>
        {[avatar1, avatar2, avatar3].map((src, idx) => (
          <img key={idx} src={src} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        ))}
        <span>Invite your teammates to start collaborating</span>
      </div>

      {inviteVisible && (
        <form
          ref={inviteInputRef}
          onSubmit={handleInviteSubmit}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 6,
            marginTop: 6,
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input type="email" name="email" placeholder="Enter email" required />
          <button className="btn" style={{ marginLeft: 8 }}>Send</button>
        </form>
      )}

      <button className="btn" style={{ marginTop: 12 }} onClick={() => setInviteVisible((v) => !v)}>
        Invite
      </button>
    </div>
  );
}

/* placeholder SettingsModal re-uses your previous logic */
function SettingsModal({ card, formData, setFormData, close, onSave }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={close}
    >
      {/* modal inner */}
      <div
        style={{ width: 320, background: '#fff', padding: 24, borderRadius: 8, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ position: 'absolute', top: 12, right: 16, fontSize: 24, cursor: 'pointer' }} onClick={close}>
          &times;
        </span>

        <form onSubmit={onSave}>
          <label>Name</label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <button className="btn" style={{ marginTop: 12 }} type="submit">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}