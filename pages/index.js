import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, Target, Clock, AlertCircle, CheckCircle, Download, Upload, Trash2, Edit3, Filter, BarChart3 } from 'lucide-react';

const CEOSmartCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [taskForm, setTaskForm] = useState({
    title: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timebound: '',
    priority: 'high',
    category: 'strategic',
    dueDate: '',
    status: 'not-started',
    progress: 0
  });

  // Load data on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('ceo-smart-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save data whenever tasks change
  useEffect(() => {
    localStorage.setItem('ceo-smart-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const resetForm = () => {
    setTaskForm({
      title: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timebound: '',
      priority: 'high',
      category: 'strategic',
      dueDate: '',
      status: 'not-started',
      progress: 0
    });
    setEditingTask(null);
  };

  const handleSubmit = () => {
    if (!taskForm.title || !taskForm.specific || !taskForm.measurable || !taskForm.achievable || !taskForm.relevant || !taskForm.timebound || !taskForm.dueDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newTask = {
      id: editingTask ? editingTask.id : Date.now(),
      ...taskForm,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? newTask : task));
    } else {
      setTasks([...tasks, newTask]);
    }

    resetForm();
    setShowTaskModal(false);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTaskProgress = (id, progress, status) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, progress, status, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ceo-smart-tasks-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target.result);
          setTasks(importedTasks);
          alert('Tasks imported successfully!');
        } catch (error) {
          alert('Error importing tasks. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      return priorityMatch && statusMatch;
    });
  }, [tasks, filterPriority, filterStatus]);

  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => task.dueDate === date);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task }) => (
    <div className={`p-4 rounded-lg border-2 ${getPriorityColor(task.priority)} mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">{task.title}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setTaskForm(task);
              setEditingTask(task);
              setShowTaskModal(true);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={() => deleteTask(task.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="space-y-1 mb-3">
        <p className="text-xs"><strong>S:</strong> {task.specific}</p>
        <p className="text-xs"><strong>M:</strong> {task.measurable}</p>
        <p className="text-xs"><strong>A:</strong> {task.achievable}</p>
        <p className="text-xs"><strong>R:</strong> {task.relevant}</p>
        <p className="text-xs"><strong>T:</strong> {task.timebound}</p>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
          {task.status.replace('-', ' ').toUpperCase()}
        </span>
        <span className="text-xs font-medium">{task.category}</span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => updateTaskProgress(task.id, Math.min(task.progress + 25, 100), task.progress >= 75 ? 'completed' : 'in-progress')}
          className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
        >
          +25%
        </button>
        <button 
          onClick={() => updateTaskProgress(task.id, 100, 'completed')}
          className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
        >
          Complete
        </button>
      </div>
    </div>
  );

  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = getTasksForDate(date);
      const isToday = date === new Date().toISOString().split('T')[0];
      const isSelected = date === selectedDate;
      
      days.push(
        <div 
          key={day}
          className={`p-2 border cursor-pointer hover:bg-blue-50 ${isToday ? 'bg-blue-100 font-bold' : ''} ${isSelected ? 'bg-blue-200' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="font-medium">{day}</div>
          <div className="space-y-1 mt-1">
            {dayTasks.slice(0, 2).map(task => (
              <div key={task.id} className={`text-xs p-1 rounded ${getPriorityColor(task.priority)}`}>
                {task.title.substring(0, 15)}...
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-xs text-gray-600">+{dayTasks.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
    
    return { total, completed, inProgress, overdue };
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Target className="mr-3 text-blue-600" />
            CEO SMART Goals & Tasks
          </h1>
          <div className="flex gap-3">
            <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer flex items-center">
              <Upload size={18} className="mr-2" />
              Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <button onClick={exportData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
              <Download size={18} className="mr-2" />
              Export
            </button>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              New SMART Goal
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Goals</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentView('calendar')}
              className={`px-4 py-2 rounded flex items-center ${currentView === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <Calendar size={18} className="mr-2" />
              Calendar View
            </button>
            <button 
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded flex items-center ${currentView === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <BarChart3 size={18} className="mr-2" />
              List View
            </button>
          </div>

          <div className="flex gap-3">
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border rounded"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border rounded"
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {currentView === 'calendar' ? (
          <>
            {/* Calendar */}
            <div className="col-span-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 font-bold text-center bg-gray-100">{day}</div>
                ))}
                {generateCalendar()}
              </div>
            </div>

            {/* Selected Date Tasks */}
            <div className="col-span-4 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getTasksForDate(selectedDate).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {getTasksForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No tasks scheduled for this date</p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* List View */
          <div className="col-span-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">All SMART Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-gray-500 text-center py-8 col-span-full">No tasks match the current filters</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingTask ? 'Edit SMART Goal' : 'Create New SMART Goal'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Title</label>
                <input 
                  type="text" 
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select 
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="strategic">Strategic</option>
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="people">People</option>
                    <option value="growth">Growth</option>
                    <option value="innovation">Innovation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specific - What exactly will you accomplish?</label>
                <textarea 
                  value={taskForm.specific}
                  onChange={(e) => setTaskForm({...taskForm, specific: e.target.value})}
                  className="w-full p-2 border rounded h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Measurable - How will you measure progress?</label>
                <textarea 
                  value={taskForm.measurable}
                  onChange={(e) => setTaskForm({...taskForm, measurable: e.target.value})}
                  className="w-full p-2 border rounded h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Achievable - How will you accomplish this goal?</label>
                <textarea 
                  value={taskForm.achievable}
                  onChange={(e) => setTaskForm({...taskForm, achievable: e.target.value})}
                  className="w-full p-2 border rounded h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Relevant - Why is this goal important?</label>
                <textarea 
                  value={taskForm.relevant}
                  onChange={(e) => setTaskForm({...taskForm, relevant: e.target.value})}
                  className="w-full p-2 border rounded h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time-bound - When will you complete this?</label>
                <textarea 
                  value={taskForm.timebound}
                  onChange={(e) => setTaskForm({...taskForm, timebound: e.target.value})}
                  className="w-full p-2 border rounded h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingTask ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CEOSmartCalendar;
