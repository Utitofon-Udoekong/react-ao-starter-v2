import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AOClient, type Task } from '../lib/aoconnect';

interface TaskListProps {
  aoClient: AOClient;
  onRefresh?: () => void;
}

export interface TaskListRef {
  fetchTasks: () => void;
}

const TaskList = forwardRef<TaskListRef, TaskListProps>(({ aoClient, onRefresh }, ref) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'high':
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        icon: '🔴'
      };
    case 'medium':
      return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/50',
        icon: '🟡'
      };
    case 'low':
      return {
        color: 'text-green-400',
        bg: 'bg-green-500/20',
        border: 'border-green-500/50',
        icon: '🟢'
      };
    default:
      return {
        color: 'text-gray-400',
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/50',
        icon: '⚪'
      };
  }
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

const fetchTasks = async () => {
    if (!aoClient) return;
    setLoading(true);
  try {
      const res = await aoClient.getTasks();
      if (res.success && res.data && res.data.tasks) setTasks(res.data.tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
  } finally {
      setLoading(false);
  }
};

const toggleTask = async (task: Task) => {
    if (!aoClient) return;

  if (task.completed) {
    // If task is completed, we can't uncomplete it (as per the AO process design)
    return;
  }

  // Complete the task
    setCompletingTask(task.id);
  try {
      const res = await aoClient.completeTask(task.id);
    
    if (res.success) {
            await fetchTasks();
        onRefresh?.(); // Emit refresh event for points update
    } else {
      console.error('Failed to complete task:', res.error);
    }
  } catch (err) {
    console.error('Failed to complete task:', err);
  } finally {
      setCompletingTask(null);
  }
};

const deleteTask = async (taskId: string) => {
    if (!aoClient) return;
    setDeletingTask(taskId);
  try {
      const res = await aoClient.deleteTask(taskId);
    if (res.success) await fetchTasks();
  } catch (err) {
    console.error('Failed to delete task:', err);
  } finally {
      setDeletingTask(null);
  }
};

  // Expose fetchTasks to parent component
  useImperativeHandle(ref, () => ({
    fetchTasks
  }));

// Auto-refresh when aoClient changes (only once)
  useEffect(() => {
    if (aoClient) {
    fetchTasks();
  }
  }, [aoClient]);

  return (
    <div className="task-list">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Your Tasks</h2>
            <p className="text-sm text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button 
          onClick={fetchTasks} 
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">No tasks yet</p>
          <p className="text-sm text-gray-500">Create your first task to get started!</p>
        </div>
      ) : (
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-600/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {tasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className={`hover:bg-gray-700/30 transition-colors duration-200 ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >

                    {/* Status Checkbox */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button 
                          onClick={() => toggleTask(task)} 
                          disabled={completingTask === task.id} 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-400 hover:border-green-400 hover:bg-green-500/20'
                          }`}
                        >
                          {task.completed ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd" />
                            </svg>
                          ) : completingTask === task.id ? (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : null}
                        </button>
                      </div>
                    </td>

                    {/* Task Details */}
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          task.completed ? 'line-through text-gray-400' : 'text-white'
                        }`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className={`text-xs mt-1 truncate max-w-xs ${
                            task.completed ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getPriorityConfig(task.priority).bg
                      } ${getPriorityConfig(task.priority).color} ${
                        getPriorityConfig(task.priority).border
                      }`}>
                        {getPriorityConfig(task.priority).icon} {task.priority.toUpperCase()}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(task.created)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        disabled={deletingTask === task.id}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingTask === task.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

export default React.memo(TaskList);

