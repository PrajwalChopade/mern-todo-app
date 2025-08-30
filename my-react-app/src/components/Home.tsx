import React, { useState, useEffect } from "react";
import axios from "axios";
import { User } from "../services/authService";

// Define Task type
interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  priority?: "High" | "Medium" | "Low";
  completed?: boolean;
  completedAt?: string;
}

// Define Theme type
type Theme = "light" | "dark" | "auto";

// Define props for Home component
interface HomeProps {
  user: User;
  onLogout: () => void;
}

function Home({ user, onLogout }: HomeProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "completed">("active");
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('taskflow-theme');
    return (saved as Theme) || 'light';
  });
  const [isDark, setIsDark] = useState(false);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('taskflow-theme', theme);
    
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else { // auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleAdd = () => setShowAddModal(true);

  const handleDelete = async (id: string) => {
    const originalTasks = [...tasks];
    const originalCompletedTasks = [...completedTasks];
    
    // Optimistically update UI
    setTasks((prev) => prev.filter((t) => t._id !== id));
    setCompletedTasks((prev) => prev.filter((t) => t._id !== id));
    
    try {
      await axios.delete(`https://mern-todo-app-0f8z.onrender.com/deleteTask/${id}`);
    } catch (err) {
      console.error("Error deleting task:", err);
      // Revert on error
      setTasks(originalTasks);
      setCompletedTasks(originalCompletedTasks);
    }
  };

  const handleUpdate = (task: Task) => {
    setSelectedTask(task);
    setShowUpdateModal(true);
  };

  const handleToggleComplete = async (id: string) => {
    try {
      await axios.patch(`https://mern-todo-app-0f8z.onrender.com/toggleTask/${id}`);
      await refreshTasks();
    } catch (err) {
      console.error("Error toggling task completion:", err);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://mern-todo-app-0f8z.onrender.com/active-tasks");
        setTasks(res.data || []);
        
        const completedRes = await axios.get("https://mern-todo-app-0f8z.onrender.com/completed-tasks");
        setCompletedTasks(completedRes.data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setTasks([]);
        setCompletedTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const formatDate = (isoString?: string) => {
    if (!isoString) return "No date";
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const refreshTasks = async () => {
    try {
      const res = await axios.get("https://mern-todo-app-0f8z.onrender.com/active-tasks");
      setTasks(res.data || []);
      
      const completedRes = await axios.get("https://mern-todo-app-0f8z.onrender.com/completed-tasks");
      setCompletedTasks(completedRes.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const PriorityBadge = ({ priority = "Medium" }: { priority?: string }) => {
    const styles = {
      High: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg",
      Medium: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg",
      Low: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg",
    };
    const icons = {
      High: "🔥",
      Medium: "⚡",
      Low: "🌟",
    };
    const priorityKey = priority as keyof typeof styles;
    return (
      <span
        className={`text-xs font-bold px-3 py-1.5 rounded-full transform hover:scale-110 transition-all duration-300
        ${styles[priorityKey] || styles.Medium}`}
      >
        {icons[priorityKey] || icons.Medium} {priority}
      </span>
    );
  };

  const currentTasks = viewMode === "active" ? tasks : completedTasks;
  const isEmpty = currentTasks.length === 0;

  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-violet-100 via-sky-50 to-cyan-100'
    } p-4 sm:p-6 lg:p-8`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse ${
          isDark 
            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30' 
            : 'bg-gradient-to-r from-purple-400/20 to-pink-400/20'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse ${
          isDark 
            ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30' 
            : 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20'
        }`} style={{animationDelay: '1s'}}></div>
      </div>

      <header className="relative z-10 max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className={`text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r animate-pulse ${
              isDark 
                ? 'from-purple-400 via-pink-400 to-cyan-400' 
                : 'from-indigo-600 via-purple-600 to-pink-600'
            }`}>
              ✨ TaskFlow
            </h1>
            <p className={`text-lg font-medium px-4 py-2 rounded-full backdrop-blur-sm shadow-sm ${
              isDark 
                ? 'text-slate-300 bg-slate-800/50' 
                : 'text-slate-700 bg-white/50'
            }`}>
              🚀 Transform your productivity journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={cycleTheme}
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm
              shadow-lg hover:scale-105 transform transition-all duration-500 border-2 ${
                isDark 
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border-slate-500/50 hover:from-slate-600 hover:to-slate-700' 
                  : 'bg-gradient-to-r from-white to-gray-50 text-gray-700 border-gray-200 hover:from-gray-50 hover:to-white'
              }`}
              title={`Current: ${theme} theme`}
            >
              <span className="text-lg group-hover:rotate-180 transition-transform duration-500">
                {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🌓'}
              </span>
              <span className="capitalize">{theme}</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={handleAdd}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-base
              shadow-lg hover:shadow-purple-500/25 hover:scale-105 
              transform transition-all duration-500 border-2 border-white/20
              hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500"
            >
              <span className="text-xl group-hover:rotate-180 transition-transform duration-500">+</span>
              <span className="font-bold tracking-wide">Add Task</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* View Toggle Buttons */}
            <div className="flex bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-1 border border-white/30 dark:border-slate-700/30">
              <button
                onClick={() => setViewMode("active")}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                  viewMode === "active"
                    ? isDark 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                📋 Active ({tasks.length})
              </button>
              <button
                onClick={() => setViewMode("completed")}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                  viewMode === "completed"
                    ? isDark 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                ✅ Completed ({completedTasks.length})
              </button>
            </div>

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform"
                title={`Signed in as ${user.name}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className={`inline-flex items-center gap-4 px-8 py-6 backdrop-blur-lg rounded-3xl shadow-2xl ${
              isDark ? 'bg-slate-800/90' : 'bg-white/90'
            }`}>
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                Loading your amazing tasks...
              </span>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-20">
            <div className={`inline-block max-w-md p-8 backdrop-blur-lg rounded-3xl shadow-2xl border ${
              isDark 
                ? 'bg-slate-800/90 border-purple-800' 
                : 'bg-white/90 border-purple-200'
            }`}>
              <div className="text-6xl mb-4 animate-bounce">
                {viewMode === "active" ? "🎉" : "🏆"}
              </div>
              <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                isDark 
                  ? 'from-purple-400 to-pink-400' 
                  : 'from-purple-600 to-pink-600'
              }`}>
                {viewMode === "active" ? "Ready for Greatness!" : "All Caught Up!"}
              </h3>
              <p className={`mb-6 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {viewMode === "active" 
                  ? "Your productivity journey starts here. Create your first task and watch the magic happen! ✨"
                  : "Great job! You've completed all your tasks. Time to add some new challenges! 🌟"
                }
              </p>
              {viewMode === "active" && (
                <button
                  onClick={handleAdd}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl
                  shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  🚀 Start Creating
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentTasks.map((task, i) => (
              <article
                key={task._id}
                className={`group relative rounded-3xl p-6 border shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:rotate-1
                transition-all duration-500 animate-fade-in
                before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-purple-500/10 before:to-pink-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 ${
                  isDark 
                    ? 'bg-slate-800/80 backdrop-blur-lg border-slate-700/50' 
                    : 'bg-white/80 backdrop-blur-lg border-white/50'
                } ${task.completed ? 'opacity-75' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Mark as Done Checkbox - only show for active tasks */}
                      {viewMode === "active" && (
                        <button
                          onClick={() => handleToggleComplete(task._id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                            task.completed 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-transparent text-white' 
                              : isDark
                                ? 'border-slate-400 hover:border-emerald-400'
                                : 'border-gray-400 hover:border-emerald-500'
                          }`}
                          title={task.completed ? "Mark as pending" : "Mark as completed"}
                        >
                          {task.completed && <span className="text-sm">✓</span>}
                        </button>
                      )}
                      
                      {/* Completed indicator for completed tasks */}
                      {viewMode === "completed" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                          <span className="text-sm">✓</span>
                        </div>
                      )}
                      
                      <h3 className={`text-xl font-bold break-words group-hover:text-purple-700 transition-colors duration-300 ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      } ${task.completed ? 'line-through opacity-75' : ''}`}>
                        {task.title || "✨ Untitled Magic"}
                      </h3>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>

                  <p className={`mb-6 line-clamp-3 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  } ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.description || "No description available."}
                  </p>

                  <div className="space-y-4">
                    <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl ${
                      isDark 
                        ? 'text-slate-300 bg-gradient-to-r from-slate-700/50 to-slate-600/50' 
                        : 'text-slate-600 bg-gradient-to-r from-blue-50 to-purple-50'
                    }`}>
                      <span className="text-lg">📅</span>
                      <span>{viewMode === "completed" ? "Completed:" : "Due:"} </span>
                      <span className={`font-bold ${
                        isDark ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        {viewMode === "completed" && task.completedAt 
                          ? formatDate(task.completedAt)
                          : formatDate(task.dueDate)
                        }
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                      {viewMode === "active" ? (
                        <>
                          <button
                            onClick={() => handleUpdate(task)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                            bg-gradient-to-r from-blue-500 to-purple-600 text-white
                            shadow-lg hover:shadow-xl hover:scale-105 hover:from-purple-600 hover:to-blue-500
                            transition-all duration-300"
                          >
                            <span className="text-lg">✏️</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                            bg-gradient-to-r from-red-500 to-pink-600 text-white
                            shadow-lg hover:shadow-xl hover:scale-105 hover:from-pink-600 hover:to-red-500
                            transition-all duration-300"
                          >
                            <span className="text-lg">🗑️</span>
                            <span>Remove</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleComplete(task._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                            bg-gradient-to-r from-yellow-500 to-orange-600 text-white
                            shadow-lg hover:shadow-xl hover:scale-105 hover:from-orange-600 hover:to-yellow-500
                            transition-all duration-300"
                          >
                            <span className="text-lg">↶</span>
                            <span>Reactivate</span>
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                            bg-gradient-to-r from-red-500 to-pink-600 text-white
                            shadow-lg hover:shadow-xl hover:scale-105 hover:from-pink-600 hover:to-red-500
                            transition-all duration-300"
                          >
                            <span className="text-lg">🗑️</span>
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal 
          onClose={() => setShowAddModal(false)} 
          onTaskAdded={refreshTasks}
          isDark={isDark}
        />
      )}

      {/* Update Task Modal */}
      {showUpdateModal && selectedTask && (
        <UpdateTaskModal 
          task={selectedTask}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedTask(null);
          }} 
          onTaskUpdated={refreshTasks}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// Add Task Modal Component
const AddTaskModal = ({ onClose, onTaskAdded, isDark }: { 
  onClose: () => void; 
  onTaskAdded: () => void;
  isDark: boolean;
}) => {
  const [textInput, setTextInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTask = async () => {
    if (!textInput.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newTask = {
        title: textInput,
        description: descInput,
        dueDate: dateInput,
        priority: priority,
      };

      await axios.post("https://mern-todo-app-0f8z.onrender.com/addTask", newTask);
      
      setTextInput("");
      setDescInput("");
      setDateInput("");
      setPriority("Medium");
      onTaskAdded();
      onClose();
    } catch (err) {
      console.error("Error adding task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-fade-in ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">✨</span>
              Create New Task
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Task Title
            </label>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="What needs to be done? ✨"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 ${
                isDark 
                  ? 'border-purple-600 bg-slate-700 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-800' 
                  : 'border-purple-200 bg-white text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-200'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Add more details... 📝"
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 resize-none ${
                isDark 
                  ? 'border-purple-600 bg-slate-700 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-800' 
                  : 'border-purple-200 bg-white text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-200'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Due Date
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 ${
                  isDark 
                    ? 'border-purple-600 bg-slate-700 text-white focus:border-purple-400 focus:ring-purple-800' 
                    : 'border-purple-200 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 ${
                  isDark 
                    ? 'border-purple-600 bg-slate-700 text-white focus:border-purple-400 focus:ring-purple-800' 
                    : 'border-purple-200 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200'
                }`}
              >
                <option value="High">🔥 High</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Low">🌟 Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 border-2 font-bold rounded-xl transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={addTask}
              disabled={!textInput.trim() || isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl 
              hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 transition-all duration-200"
            >
              {isSubmitting ? "Creating..." : "Create Task ✨"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update Task Modal Component
const UpdateTaskModal = ({ task, onClose, onTaskUpdated, isDark }: { 
  task: Task; 
  onClose: () => void; 
  onTaskUpdated: () => void;
  isDark: boolean;
}) => {
  const [textInput, setTextInput] = useState(task.title);
  const [descInput, setDescInput] = useState(task.description);
  const [dateInput, setDateInput] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
  );
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">(task.priority || "Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTask = async () => {
    if (!textInput.trim()) return;
    
    setIsSubmitting(true);
    try {
      await axios.put(`https://mern-todo-app-0f8z.onrender.com/updateTask/${task._id}`, {
        title: textInput,
        description: descInput,
        dueDate: dateInput,
        priority: priority
      });
      
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-fade-in ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">✏️</span>
              Update Task
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Task Title
            </label>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="What needs to be done? ✨"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 ${
                isDark 
                  ? 'border-blue-600 bg-slate-700 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-800' 
                  : 'border-blue-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Add more details... 📝"
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 resize-none ${
                isDark 
                  ? 'border-blue-600 bg-slate-700 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-800' 
                  : 'border-blue-200 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Due Date
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 ${
                  isDark 
                    ? 'border-blue-600 bg-slate-700 text-white focus:border-blue-400 focus:ring-blue-800' 
                    : 'border-blue-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "High" | "Medium" | "Low")}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 ${
                  isDark 
                    ? 'border-blue-600 bg-slate-700 text-white focus:border-blue-400 focus:ring-blue-800' 
                    : 'border-blue-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200'
                }`}
              >
                <option value="High">🔥 High</option>
                <option value="Medium">⚡ Medium</option>
                <option value="Low">🌟 Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 border-2 font-bold rounded-xl transition-colors ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={updateTask}
              disabled={!textInput.trim() || isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl 
              hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 transition-all duration-200"
            >
              {isSubmitting ? "Updating..." : "Update Task ✏️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
