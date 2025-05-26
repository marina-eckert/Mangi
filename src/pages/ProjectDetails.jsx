import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import domtoimage from 'dom-to-image';
import Sidebar from '../components/Sidebar';
import { MdHeight, MdAccountTree } from 'react-icons/md';

function ProjectDetails() {
  const { projectId } = useParams();
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: '',
    subtasks: [],
    dependencies: []
  });
  const [criticalActivities, setCriticalActivities] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project?.title || '');
  const [editedDescription, setEditedDescription] = useState(project?.description || '');
  const [editedStartDate, setEditedStartDate] = useState(project?.startDate || '');
  const [editedEndDate, setEditedEndDate] = useState(project?.endDate || '');

  const handleSave = async () => {
    const updatedProject = {
      ...project,
      title: editedTitle,
      description: editedDescription,
      startDate: editedStartDate,
      endDate: editedEndDate,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updated = await response.json();
      // Optionally update parent state or reload
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Error updating project");
    }
  };

  const addUser = () => {
  if (!newUserName.trim()) return;
  setUsers(prev => [...prev, newUserName.trim()]);
  setNewUserName('');
};

  const removeTask = async (taskId) => {
    const token = localStorage.getItem('token');
    console.log('🛡 removeTask token:', token);
    if (!token) {
      return alert('Not logged in—no token found.');
    }
    try {
      const res = await fetch(
        `http://localhost:3000/api/projects/${projectId}/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );
      console.log('🗑 DELETE status:', res.status);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Delete failed: ${res.status}`);
      }
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t._id !== taskId)
      }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      setLoadingProject(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch project');
        setProject(data[projectId] || data);
      } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
        setLoadingProject(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleInputChange = (e, path = []) => {
    const { name, value } = e.target;
    if (path.length === 0) {
      setNewTask(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTask(prev => {
        const subtasks = [...prev.subtasks];
        let current = subtasks;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]].subtasks;
        }
        current[path[path.length - 1]][name] = value;
        return { ...prev, subtasks };
      });
    }
  };

  const addSubtask = (path = []) => {
  setNewTask(prev => {
    const clone = JSON.parse(JSON.stringify(prev)); 
    let current = clone.subtasks;

    for (let i = 0; i < path.length; i++) {
      current = current[path[i]].subtasks;
    }

    current.push({ title: '', description: '', startDate: '', endDate: '', subtasks: [] });

    return clone;
  });
};

  const removeSubtask = (path) => {
    setNewTask(prev => {
      const subtasks = [...prev.subtasks];

      let current = subtasks;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]].subtasks;
      }

      current.splice(path[path.length - 1], 1);
      return { ...prev, subtasks };
    });
  };
  
  const renderSubtasks = (subtasks, path = []) =>
    subtasks.map((task, idx) => {
      const newPath = [...path, idx];
      return (
        <div key={newPath.join('-')} style={{ marginLeft: path.length * 20, border: '1px dashed #ccc', padding: '10px', marginTop: '10px' }}>
          <input
            type="text"
            name="title"
            placeholder="Subtask title"
            value={task.title}
            onChange={(e) => handleInputChange(e, newPath)}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={task.description}
            onChange={(e) => handleInputChange(e, newPath)}
          />
          <input
            type="date"
            name="startDate"
            value={task.startDate}
            onChange={(e) => handleInputChange(e, newPath)}
          />
          <input
            type="date"
            name="endDate"
            value={task.endDate}
            onChange={(e) => handleInputChange(e, newPath)}
          />

          <div style={{ marginTop: '5px' }}>
            <button type="button"  onClick={() => addSubtask(newPath)}>Add Subtask</button>
            <button type="button" onClick={() => removeSubtask(newPath)} style={{ marginLeft: '10px', color: 'red' }}>Remove</button>
          </div>

          {renderSubtasks(task.subtasks, newPath)}
        </div>
      );
    });

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create task');
      alert('Task created');
      setProject(prev => ({ ...prev, tasks: [...prev.tasks, data] }));
      setNewTask({ title: '', description: '', startDate: '', endDate: '', priority: '', assignee: '', subtasks: [] });
    } catch (err) {
      alert(err.message);
    }
  };

  function cleanTaskForSave(task) {
    const cleanSubtasks = (subtasks) => {
      return subtasks.map(st => {
        const cleaned = { ...st };
        if (typeof cleaned._id === 'string' && cleaned._id.startsWith('temp-')) {
          delete cleaned._id;
        }
        if (cleaned.subtasks?.length) {
          cleaned.subtasks = cleanSubtasks(cleaned.subtasks);
        }
        return cleaned;
      });
    };

    const cleanedTask = { ...task };
    if (cleanedTask.subtasks?.length) {
      cleanedTask.subtasks = cleanSubtasks(cleanedTask.subtasks);
    }
    if (typeof cleanedTask._id === 'string' && cleanedTask._id.startsWith('temp-')) {
      delete cleanedTask._id;
    }
    return cleanedTask;
  }

  const saveTask = async (projectId, taskId, updatedTaskData) => {
    console.log('saving task')
    const token = localStorage.getItem('token');
    try {
      let cleanedTask = cleanTaskForSave(updatedTaskData);
      console.log('json: ', cleanedTask)
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save task");
      }

      const updatedTask = await response.json();

      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task._id === taskId ? updatedTask : task
        ),
      }));
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const TaskItem = ({ task }) => {
  return (
    <li style={{ listStyleType: 'none', marginLeft: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MdAccountTree />
        <h4 style={{ margin: 0 }}>{task.title}</h4>
      </div>
      <p>{task.description}</p>
      <p>Start: {new Date(task.startDate).toLocaleDateString()}</p>
      <p>End: {new Date(task.endDate).toLocaleDateString()}</p>

      {task.subtasks && task.subtasks.length > 0 && (
        <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
          {task.subtasks.map(subtask => (
            <TaskItem key={subtask._id} task={subtask} />
          ))}
        </ul>
      )}
    </li>
  );
};
  const TaskItemEditor = ({
  task,
  onChange,
  onSave,
  onRemove,
  isSubtask = false,
  projectStart,
  projectEnd,
  parentTaskDates = null,
  allTasks = []
}) => {
  // 1) Local state for the fields
  const [local, setLocal] = useState({
    title: task.title || '',
    description: task.description || '',
    startDate: task.startDate || '',
    endDate:   task.endDate   || '',
    dependencies: task.dependencies || []
  });

    // 1b) Local state for assigned users
  const [localUsers, setLocalUsers] = useState(task.assignedUsers || []);
  useEffect(() => {
    setLocalUsers(task.assignedUsers || []);
  }, [task.assignedUsers]);

  // 1c) Demo “add user” handler
  const addUserToTask = () => {
    const name = prompt("Enter user name to assign to this task:");
    if (name && !localUsers.includes(name)) {
      const updatedUsers = [...localUsers, name];
      setLocalUsers(updatedUsers);
      onChange({ ...task, ...local, assignedUsers: updatedUsers });
    }
  };

  // 2) If the parent prop changes (e.g. after saving), sync local state
  useEffect(() => {
    setLocal({
      title: task.title || '',
      description: task.description || '',
      startDate: task.startDate || '',
      endDate:   task.endDate   || '',
      dependencies: task.dependencies || []
    });
  }, [task]);

  // 3) When any field loses focus, push the change up
  const handleBlur = () => {
    onChange({ ...task, ...local });
  };

  // 4) handlers that only update local state
  const handleFieldChange = e => {
    const { name, value } = e.target;
    setLocal(prev => ({ ...prev, [name]: value }));
  };

  // 5) Add a new subtask—still default to parent or task dates
  const addSubtask = () => {
    const defaultStart = isSubtask
      ? parentTaskDates.startDate
      : task.startDate;
    const defaultEnd = isSubtask
      ? parentTaskDates.endDate
      : task.endDate;

    const newSubtasks = [
      ...(task.subtasks || []),
      {
        _id: `temp-${Date.now()}`,
        title: '',
        description: '',
        startDate: defaultStart,
        endDate:   defaultEnd,
        subtasks:  []
      }
    ];
    onChange({ ...task, subtasks: newSubtasks });
  };


    const removeSubtask = (index) => {
      const newSubtasks = [...(task.subtasks || [])];
      newSubtasks.splice(index, 1);
      onChange({ ...task, subtasks: newSubtasks });
    };


    // ←—— INSERT THIS: handle updates to an existing nested subtask
    const handleSubtaskChange = (index, updatedSubtask) => {
      const newSubtasks = [...(task.subtasks || [])];
      newSubtasks[index] = updatedSubtask;
      onChange({ ...task, subtasks: newSubtasks });
    };

    const handleSave = () => {
      if (onSave) {
        onSave(task);
      }
    };

    const minDate = isSubtask ? parentTaskDates?.startDate : projectStart;
    const maxDate = isSubtask ? parentTaskDates?.endDate : projectEnd;

    return (
    <div style={{ marginLeft: isSubtask ? 20 : 0, borderLeft: isSubtask ? '1px solid #ccc' : 'none', paddingLeft: isSubtask ? 10 : 0 }}>
      {/* Title */}
      <input
        name="title"
        value={local.title}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        placeholder="Title"
      />

      {/* Description */}
      <input
        name="description"
        value={local.description}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        placeholder="Description"
      />

      {/* Start Date */}
      <input
        type="date"
        name="startDate"
        value={local.startDate.substring(0,10)}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        min={isSubtask ? parentTaskDates.startDate : projectStart}
        max={isSubtask ? parentTaskDates.endDate   : projectEnd}
      />

      {/* End Date */}
      <input
        type="date"
        name="endDate"
        value={local.endDate.substring(0,10)}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        min={isSubtask ? parentTaskDates.startDate : projectStart}
        max={isSubtask ? parentTaskDates.endDate   : projectEnd}
      />

            {/* ── Assigned Users Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', marginLeft: 10 }}>
        {localUsers.map((u, i) => (
          <div
            key={i}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#1e293b',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 6,
              fontSize: 12,
            }}
          >
            {u.charAt(0).toUpperCase()}
          </div>
        ))}
        <button
          type="button"
          onClick={addUserToTask}
          style={{
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: 'grey',
            cursor: 'pointer'
          }}
        >
          + Assign
        </button>
      </div>
        
         <button type="button" style= {{marginLeft:10}} onClick={addSubtask}>Add Subtask</button>
      {!isSubtask && (
        <>
          <button
            type="button"
            onClick={() => {
              const updated = { ...task, ...local, subtasks: task.subtasks };
              onSave(updated);
            }}
            style={{ marginLeft: '10px' }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onRemove && onRemove(task._id)}
            style={{ marginLeft: '10px', color: 'red' }}
          >
            Remove
          </button>
        </>
      )}


        {(task.subtasks || []).map((subtask, i) => (
          <div key={subtask._id} style={{ marginTop: 10, paddingLeft: 20 }}>
            <TaskItemEditor
              task={subtask}
              onChange={(updatedSubtask) => handleSubtaskChange(i, updatedSubtask)}
              onSave={() => {}}
              isSubtask={true}
              parentTaskDates={{
                startDate: task.startDate,
                endDate: task.endDate
              }}
              projectStart={projectStart}
              projectEnd={projectEnd}
              allTasks={allTasks}
            />
            <button type="button" onClick={() => removeSubtask(i)} style={{ color: 'red' }}>
              Remove Subtask
            </button>
          </div>
        ))}
      </div>
    );
  };


  const handleTaskUpdate = (index, updatedTask) => {
    setProject(prevProject => {
      const updatedTasks = [...prevProject.tasks];
      updatedTasks[index] = updatedTask;
      return { ...prevProject, tasks: updatedTasks };
    });
  };
  
  const convertTasksToGantt = (tasks, parentId = null) => {
    const flatList = [];

    tasks.forEach(task => {
      const taskId = task._id || `temp-${Math.random()}`;
      const ganttTask = {
        id: taskId,
        name: task.title || 'Untitled',
        start: new Date(task.startDate),
        end: new Date(task.endDate),
        type: parentId ? 'task' : 'project',
        progress: 0,
        project: parentId,
        dependencies: '',
      };

      flatList.push(ganttTask);

      if (task.subtasks?.length) {
        flatList.push(...convertTasksToGantt(task.subtasks, taskId));
      }
    });

    return flatList;
  };

  function flattenLeafTasks(tasks, parentId = null) {
    const leaves = [];

    function helper(taskList) {
      taskList.forEach(task => {
        if (!task.subtasks || task.subtasks.length === 0) {
          leaves.push({
            id: task._id || `temp-${Math.random()}`,
            title: task.title,
            start: new Date(task.startDate),
            end: new Date(task.endDate),
            duration: (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24),
            dependencies: task.dependencies ? [...task.dependencies] : [],
          });
        } else {
          helper(task.subtasks);
        }
      });
    }

    helper(tasks);

    const leafIdSet = new Set(leaves.map(l => l.id));

    leaves.forEach(leaf => {
      leaf.dependencies = leaf.dependencies.filter(depId => leafIdSet.has(depId));
    });

    return leaves;
  }

  // Topological sort to ensure correct processing order
  function topologicalSort(tasks) {
    const visited = new Set();
    const sorted = [];

    // Map tasks by id for quick lookup
    const taskMap = {};
    tasks.forEach(t => (taskMap[t.id] = t));

    function visit(task) {
      if (visited.has(task.id)) return;
      visited.add(task.id);

      task.dependencies.forEach(depId => {
        if (taskMap[depId]) visit(taskMap[depId]);
      });

      sorted.push(task);
    }

    tasks.forEach(visit);

    return sorted;
  }

  function calculateCriticalPath(activities) {
    const actMap = {};
    activities.forEach(act => {
      actMap[act.id] = { ...act, ES: 0, EF: 0, LS: Infinity, LF: Infinity, slack: 0, isCritical: false };
    });

    const sortedActivities = topologicalSort(activities);

    sortedActivities.forEach(act => {
      if (act.dependencies.length === 0) {
        actMap[act.id].ES = 0;
        actMap[act.id].EF = act.duration;
      } else {
        const maxEF = Math.max(...act.dependencies.map(depId => actMap[depId].EF));
        actMap[act.id].ES = maxEF;
        actMap[act.id].EF = maxEF + act.duration;
      }
    });

    const maxEF = Math.max(...activities.map(act => actMap[act.id].EF));

    activities.forEach(act => {
      const hasDependents = activities.some(a => a.dependencies.includes(act.id));
      if (!hasDependents) {
        actMap[act.id].LF = maxEF;
        actMap[act.id].LS = maxEF - act.duration;
      }
    });

    let changed;
    do {
      changed = false;
      activities.forEach(act => {
        const dependents = activities.filter(a => a.dependencies.includes(act.id));
        if (dependents.length > 0) {
          const minLS = Math.min(...dependents.map(d => actMap[d.id].LS));
          if (minLS - act.duration < actMap[act.id].LS) {
            actMap[act.id].LF = minLS;
            actMap[act.id].LS = minLS - act.duration;
            changed = true;
          }
        }
      });
    } while (changed);

    // Slack and critical path marking
    activities.forEach(act => {
      const a = actMap[act.id];
      a.slack = a.LS - a.ES;
      a.isCritical = a.slack === 0;
    });

    return Object.values(actMap);
  }

  useEffect(() => {
    if (project?.tasks) {
      const leafActivities = flattenLeafTasks(project.tasks);
      const crits = calculateCriticalPath(leafActivities);
      setCriticalActivities(crits);
    }
  }, [project]);

  const downloadGanttAsImage = () => {
    const node = document.getElementById('gantt-container');

    domtoimage.toPng(node)
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = 'gantt-chart.png';
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  };

  const cardStyle = {
  background: '#FFFFFF',
  borderRadius: '12px',
  padding: '20px',
  paddingLeft: 20,
  marginLeft: 80,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};


  return (
    <div style={{ padding: '20px', backgroundColor: '#f7f6f5' }}>
      <Sidebar />
      {/* ─── Top row: Project Info + Create Task ─── */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Project Info Card */}
        <div style={{ flex: 1, ...cardStyle }}>
          {isEditing ? (
            <>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={editedDescription}
                  onChange={e => setEditedDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={editedStartDate.slice(0, 10)}
                  onChange={e => setEditedStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="date"
                  value={editedEndDate.slice(0, 10)}
                  onChange={e => setEditedEndDate(e.target.value)}
                />
              </div>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <div
                    style={{
                      display: 'flex',
                      gap: '0px',            // space between columns
                      alignItems: 'flex-start' // align tops
                    }} >
          
            <div style={{ flex: 1 }}>
              <h2>{project?.title}</h2>
            </div>

            <div>
              {project?.description && (
                <p>
                  <strong>Description:</strong> {project.description}
                </p>
              )}
              <div style={{ width: 0, height: 5 }} />
              <p>
                <strong>Start Date:</strong>{' '}
                {new Date(project?.startDate).toLocaleDateString()}
              </p>
              <div style={{ width: 0, height: 5 }} />
              <p>
                <strong>End Date:</strong>{' '}
                {new Date(project?.endDate).toLocaleDateString()}
              </p>
              <div style={{ width: 0, height: 5 }} />
              <button onClick={() => setIsEditing(true)}>
                Edit Project
              </button>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Create Task Card */}
        <div style={{ flex: 1, ...cardStyle }}>
          <h3>Create Task</h3>
          <div style={{ width: 0, height: 5 }} />
          <input
            //style={}
            type="text"
            name="title"
            placeholder="Title"
            value={newTask.title}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="startDate"
            value={newTask.startDate}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="endDate"
            value={newTask.endDate}
            onChange={handleInputChange}
          />
          <div style={{ width: 0, height: 5 }} />
          <button type="button" style= {{marginRight:10}} onClick={() => addSubtask()}>
            Add Subtask
          </button>
          
          {renderSubtasks(newTask.subtasks)}
          <button onClick={handleSubmit}>Submit Task</button>
        </div>
      </div>

      {/* ─── Middle card: Task List ─── */}
      <div style={{ listStyle: 'none',marginBottom: '20px', ...cardStyle }}>
        <h3>Tasks</h3>
        {project?.tasks?.length > 0 ? (
          <ul>
            {project.tasks.map((task, idx) => (
              <li key={task._id} style={{ listStyle: 'none', marginBottom: '10px', marginLeft:5, padding: 5,}}>
                <TaskItemEditor
                  task={task}
                  onChange={updated =>
                    handleTaskUpdate(idx, updated)
                  }
                  onSave={updated =>
                    saveTask(projectId, task._id, updated)
                  }
                  onRemove={removeTask}
                  projectStart={project.startDate}
                  projectEnd={project.endDate}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks yet.</p>
        )}
      </div>

      {/* ─── Bottom card: Critical Path & Gantt ─── */}
      <div style={cardStyle}>
        <h3>Critical and Non-Critical Activities</h3>
        <ul>
          {criticalActivities.map(act => (
            <li
              key={act.id}
              style={{
                color: act.isCritical ? 'red' : 'green',
                marginTop: '6px',
                marginBottom: '6px',
                marginLeft: 40,
              }}
            >
              {act.title} —{' '}
              {act.isCritical ? 'Critical' : 'Non-critical'} (Slack:{' '}
              {act.slack.toFixed(2)}d)
            </li>
          ))}
        </ul>

        {!loadingProject &&
          project?.tasks?.length > 0 && (
            <div id="gantt-container">
              <Gantt
                tasks={convertTasksToGantt(project.tasks)}
                viewMode={ViewMode.Day}
              />
              <button
                onClick={downloadGanttAsImage}
                style={{ marginTop: '12px' }}
              >
                Download Gantt Chart
              </button>
            </div>
          )}
      </div>
      {/* ─── Users Card ─── */}
<div style={{ ...cardStyle, marginTop: '20px',  padding: 20 }}>
  <h3>Project Collaborators</h3>
  <div style={{height: 9}}/>
  {/* Input + add button */}
  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
    <input
      type="text"
      placeholder="Enter user name"
      value={newUserName}
      onChange={e => setNewUserName(e.target.value)}
      style={{ flex: 1, padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}
    />
    <button
      onClick={addUser}
      style={{
        padding: '6px 12px',
        border: 'none',
        borderRadius: 4,
        background: '#1e293b',
        color: '#fff',
        cursor: 'pointer'
      }}
    >
      Add User
    </button>
  </div>

  {/* Display added users */}
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
    {users.map((u, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        {/* Simple avatar circle with initial */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#1e293b',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}
        >
          {u.charAt(0).toUpperCase()}
        </div>
        <span>{u}</span>
      </div>
    ))}
    {users.length === 0 && (
      <p style={{ color: '#6b7280' }}>No users added yet.</p>
    )}
  </div>
</div>

    </div>
  );
}

export default ProjectDetails;
