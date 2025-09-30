import React, { useState } from 'react';
import { AOClient } from '../lib/aoconnect';

interface CreateTaskProps {
  aoClient: AOClient;
  onTaskCreated?: () => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ aoClient, onTaskCreated }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': 
        return { 
          color: 'text-red-400', 
          bg: 'bg-red-500/20', 
          border: 'border-red-500/50',
          icon: '🔴',
          gradient: 'from-red-500 to-pink-500'
        };
      case 'medium': 
        return { 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-500/20', 
          border: 'border-yellow-500/50',
          icon: '🟡',
          gradient: 'from-yellow-500 to-orange-500'
        };
      case 'low': 
        return { 
          color: 'text-green-400', 
          bg: 'bg-green-500/20', 
          border: 'border-green-500/50',
          icon: '🟢',
          gradient: 'from-green-500 to-emerald-500'
        };
      default: 
        return { 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/20', 
          border: 'border-gray-500/50',
          icon: '⚪',
          gradient: 'from-gray-500 to-slate-500'
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aoClient) return;
    
    setIsSubmitting(true);
    try {
      const result = await aoClient.createTask({
        title: form.title,
        description: form.description,
        priority: form.priority
      });
      
      if (result.success) {
        // Reset form
        setForm({
          title: '',
          description: '',
          priority: 'medium'
        });
        
        // Emit event to parent
        onTaskCreated?.();
        
        // Show success message (you could add a toast notification here)
      } else {
        console.error('Failed to create task:', result.error);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 p-4 sm:p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">
          Create Task
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Task Title *
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            type="text"
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            placeholder="What needs to be done?"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 resize-none"
            placeholder="Add more details about this task..."
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-300">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p as 'low' | 'medium' | 'high' })}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  form.priority === p 
                    ? getPriorityConfig(p).bg + ' ' + getPriorityConfig(p).border
                    : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm">{getPriorityConfig(p).icon}</span>
                  <span className={`text-xs font-medium ${
                    form.priority === p ? getPriorityConfig(p).color : 'text-gray-400'
                  }`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !form.title.trim()}
          className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default React.memo(CreateTask);