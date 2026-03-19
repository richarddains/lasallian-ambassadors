'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  description: string
  status: string
  dueDate?: string
  event?: {
    title: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks')
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error('Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setTasks(
          tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        )
      }
    } catch (error) {
      console.error('Failed to update task')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-600">No tasks assigned</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {task.title}
                  </h3>
                  <p className="text-gray-600">{task.description}</p>
                  {task.event && (
                    <p className="text-sm text-gray-500 mt-2">
                      Event: {task.event.title}
                    </p>
                  )}
                </div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="OPEN">Open</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              {task.dueDate && (
                <p className="text-xs text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
