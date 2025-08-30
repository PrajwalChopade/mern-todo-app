import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationStats {
  totalUpcomingTasks: number;
  tasksInNext24Hours: number;
  tasksInNext12Hours: number;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    hoursUntilDue: number;
    reminderSent: boolean;
    lastReminderSent?: string;
  }>;
}

interface NotificationCenterProps {
  user: any;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ user }) => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificationStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/notification-stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching notification stats:', error);
      setError(error.response?.data?.message || 'Failed to fetch notification stats');
    } finally {
      setLoading(false);
    }
  };

  const triggerReminders = async () => {
    setTriggering(true);
    setError(null);
    try {
      await axios.post('/trigger-reminders');
      alert('Reminder check completed! Check your email and server console.');
      fetchNotificationStats(); // Refresh stats
    } catch (error: any) {
      console.error('Error triggering reminders:', error);
      const errorMessage = error.response?.data?.message || 'Error triggering reminders';
      setError(errorMessage);
      alert(`Error: ${errorMessage}. Check console for details.`);
    } finally {
      setTriggering(false);
    }
  };

  useEffect(() => {
    fetchNotificationStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchNotificationStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (hours: number) => {
    if (hours <= 0) return 'text-red-700 bg-red-200';
    if (hours <= 12) return 'text-red-600 bg-red-100';
    if (hours <= 24) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getUrgencyText = (hours: number) => {
    if (hours <= 0) return 'OVERDUE';
    if (hours <= 1) return `${Math.round(hours * 60)} min left`;
    return `${Math.round(hours)}h left`;
  };

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          🔔 Notification Center
        </h2>
        <div className="flex gap-3">
          <button
            onClick={fetchNotificationStats}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={triggerReminders}
            disabled={triggering}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 text-sm"
          >
            {triggering ? 'Checking...' : 'Test Reminders'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {stats && (
        <div>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Upcoming</h3>
              <p className="text-2xl font-bold text-blue-600">{stats?.totalUpcomingTasks || 0}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800">Next 24 Hours</h3>
              <p className="text-2xl font-bold text-orange-600">{stats?.tasksInNext24Hours || 0}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800">Next 12 Hours</h3>
              <p className="text-2xl font-bold text-red-600">{stats?.tasksInNext12Hours || 0}</p>
            </div>
          </div>

          {/* Upcoming Tasks List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Tasks</h3>
            {!stats.upcomingTasks || stats.upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">🎉 No upcoming tasks!</p>
                <p>All caught up! Create some tasks to see reminders here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-medium ${getUrgencyColor(task.hoursUntilDue)}`}>
                            {getUrgencyText(task.hoursUntilDue)}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            Due: {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        {task.reminderSent ? (
                          <div className="text-green-600">
                            ✅ Reminder sent
                            {task.lastReminderSent && (
                              <div className="text-xs text-gray-500">
                                {new Date(task.lastReminderSent).toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">⏳ Pending reminder</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">🤖 Notification System</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Automatic checks run every 30 minutes</p>
              <p>• Email reminders sent 24 hours and 12 hours before due date</p>
              <p>• Completed tasks won't receive reminders</p>
              <p>• Test the system using the "Test Reminders" button above</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !stats && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No notification data available</p>
          <button
            onClick={fetchNotificationStats}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry Loading
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
