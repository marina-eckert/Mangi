import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: '',
    assignee: '',
    subtasks: []
  });
  const [criticalActivities, setCriticalActivities] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      setLoadingProject(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
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
            <button type="button" onClick={() => addSubtask(newPath)}>Add Subtask</button>
            <button type="button" onClick={() => removeSubtask(newPath)} style={{ marginLeft: '10px', color: 'red' }}>Remove</button>
          </div>

          {renderSubtasks(task.subtasks, newPath)}
        </div>
      );
    });

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
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
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks/${taskId}`, {
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
      <li>
        <h4>{task.title}</h4>
        <p>{task.description}</p>
        <p>Start: {new Date(task.startDate).toLocaleDateString()}</p>
        <p>End: {new Date(task.endDate).toLocaleDateString()}</p>

        {task.subtasks && task.subtasks.length > 0 && (
          <ul>
            {task.subtasks.map((subtask) => (
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
    isSubtask = false,
    projectStart,
    projectEnd,
    parentTaskDates = null
  }) => {
    const handleFieldChange = (e) => {
      const { name, value } = e.target;

      if (name === 'startDate' || name === 'endDate') {
        const newDates = {
          ...task,
          [name]: value
        };

        const start = new Date(newDates.startDate || task.startDate);
        const end = new Date(newDates.endDate || task.endDate);

        if (isSubtask && parentTaskDates) {
          if (start < new Date(parentTaskDates.startDate) || end > new Date(parentTaskDates.endDate)) {
            alert(`Subtask dates must be within parent task's range: ${parentTaskDates.startDate} to ${parentTaskDates.endDate}`);
            return;
          }
        } else if (!isSubtask && projectStart && projectEnd) {
          if (start < new Date(projectStart) || end > new Date(projectEnd)) {
            alert(`Task dates must be within project range: ${projectStart} to ${projectEnd}`);
            return;
          }
        }
      }

      onChange({ ...task, [name]: value });
    };

    const handleSubtaskChange = (index, updatedSubtask) => {
      const newSubtasks = [...(task.subtasks || [])];
      newSubtasks[index] = updatedSubtask;
      onChange({ ...task, subtasks: newSubtasks });
    };

    const addSubtask = () => {
      const newSubtasks = [
        ...(task.subtasks || []),
        {
          _id: `temp-${Date.now()}`,
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          subtasks: []
        }
      ];
      onChange({ ...task, subtasks: newSubtasks });
    };

    const removeSubtask = (index) => {
      const newSubtasks = [...(task.subtasks || [])];
      newSubtasks.splice(index, 1);
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
      <div style={{ marginLeft: '20px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
        <input
          name="title"
          value={task.title}
          onChange={handleFieldChange}
          placeholder="Title"
        />
        <input
          name="description"
          value={task.description}
          onChange={handleFieldChange}
          placeholder="Description"
        />
        <input
          type="date"
          name="startDate"
          value={task.startDate ? task.startDate.substring(0, 10) : ''}
          onChange={handleFieldChange}
          min={minDate}
          max={maxDate}
        />
        <input
          type="date"
          name="endDate"
          value={task.endDate ? task.endDate.substring(0, 10) : ''}
          onChange={handleFieldChange}
          min={minDate}
          max={maxDate}
        />
        <button type="button" onClick={addSubtask}>Add Subtask</button>
        {!isSubtask && (
          <button type="button" onClick={handleSave} style={{ marginLeft: '10px' }}>Save</button>
        )}

        {(task.subtasks || []).map((subtask, i) => (
          <div key={subtask._id}>
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
            />
            <button type="button" onClick={() => removeSubtask(i)}>Remove Subtask</button>
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
    function helper(taskList, parent) {
      taskList.forEach((task, idx) => {
        if (!task.subtasks || task.subtasks.length === 0) {
          leaves.push({
            id: task._id || `temp-${Math.random()}`,
            title: task.title,
            start: new Date(task.startDate),
            end: new Date(task.endDate),
            duration: (new Date(task.endDate) - new Date(task.startDate)) / (1000 * 60 * 60 * 24),
            dependencies: [],
            index: leaves.length,
          });
        } else {
          helper(task.subtasks, task);
        }
      });
    }
    helper(tasks, null);

    for (let i = 1; i < leaves.length; i++) {
      leaves[i].dependencies.push(leaves[i - 1].id);
    }

    return leaves;
  }

  // Compute critical path for leaf activities using CPM (Critical Path Method)
  function calculateCriticalPath(activities) {
    // Map id -> activity
    const actMap = {};
    activities.forEach(act => (actMap[act.id] = { ...act, ES: 0, EF: 0, LS: Infinity, LF: Infinity, slack: 0 }));

    // Step 1: Forward pass to calculate ES and EF
    function forwardPass() {
      activities.forEach(act => {
        if (act.dependencies.length === 0) {
          actMap[act.id].ES = 0;
          actMap[act.id].EF = act.duration;
        } else {
          actMap[act.id].ES = Math.max(
            ...act.dependencies.map(depId => actMap[depId].EF)
          );
          actMap[act.id].EF = actMap[act.id].ES + act.duration;
        }
      });
    }

    // Step 2: Backward pass to calculate LS and LF
    function backwardPass() {
      // Get max EF (project finish time)
      const maxEF = Math.max(...activities.map(act => actMap[act.id].EF));

      // Initialize LF of tasks with no dependents to maxEF
      activities.forEach(act => {
        const hasDependents = activities.some(a => a.dependencies.includes(act.id));
        if (!hasDependents) {
          actMap[act.id].LF = maxEF;
          actMap[act.id].LS = maxEF - act.duration;
        }
      });

      // Iterate backward until LS and LF stabilize
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
    }

    forwardPass();
    backwardPass();

    // Step 3: Calculate slack and mark critical activities
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

  return (
      <div className="project-details">
        <h2>{project?.title}</h2>
        {project?.description && <p><strong>Description:</strong> {project.description}</p>}
        <p><strong>Start Date:</strong> {new Date(project?.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(project?.endDate).toLocaleDateString()}</p>
        <h3>Create Task</h3>
        <input
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
        <button type="button" onClick={() => addSubtask()}>Add Subtask</button>
        {renderSubtasks(newTask.subtasks)}
        <button onClick={handleSubmit}>Submit Task</button>

        <div className="task-section">
          <h3>Tasks</h3>
          {project?.tasks?.length > 0 ? (
            <ul>
              {project.tasks.map((task, idx) => (
                <li key={task._id}>
                  <TaskItemEditor
                    task={task}
                    onChange={(updatedTask) => handleTaskUpdate(idx, updatedTask)}
                    onSave={(updatedTask) => {
                      if (projectId) {
                        saveTask(projectId, task._id, updatedTask);
                      }
                    }}
                    projectStart={project.startDate}
                    projectEnd={project.endDate}
                  />
                </li>
              ))}
            </ul>
          ) : <p>No tasks yet.</p>}
        </div>
        <h3>Critical and Non-Critical Activities</h3>
        <ul>
          {criticalActivities.map(act => (
            <li key={act.id} style={{ color: act.isCritical ? 'red' : 'green' }}>
              {act.title} — Start: {act.start.toLocaleDateString()}, End: {act.end.toLocaleDateString()} — 
              {act.isCritical ? 'Critical' : 'Non-critical'} (Slack: {act.slack.toFixed(2)} days)
            </li>
          ))}
        </ul>
        {!loadingProject && project && project.tasks && project.tasks.length > 0 && (
          <Gantt
            tasks={convertTasksToGantt(project.tasks)}
            viewMode={ViewMode.Day}
          />
        )}
      </div>
  );
}

export default ProjectDetails;
