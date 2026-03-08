/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";
import type { Task, Project, TaskStatus, TaskPriority } from "../types";

const TaskDetail = () => {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<{
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  const statusColors: Record<TaskStatus, string> = {
    backlog: "bg-gray-100 text-gray-800",
    "in-progress": "bg-blue-100 text-blue-800",
    review: "bg-purple-100 text-purple-800",
    done: "bg-green-100 text-green-800",
  };

  const priorityColors: Record<TaskPriority, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    if (projectId && taskId) fetchData();
  }, [projectId, taskId]);

  const fetchData = async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([
        api.get(`/api/tasks/${taskId}`),
        api.get(`/api/projects/${projectId}`),
      ]);
      setTask(taskRes.data.data);
      setProject(projectRes.data.data);

      // Set initial edit state
      const taskData = taskRes.data.data;
      setEditedTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        assignedTo:
          typeof taskData.assignedTo === "object" && taskData.assignedTo
            ? taskData.assignedTo._id
            : taskData.assignedTo,
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString().split("T")[0]
          : undefined,
      });
    } catch (error) {
      console.error("Failed to fetch task:", error);
      navigate(`/projects/${projectId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  const isProjectManager = project?.createdBy._id === currentUserId;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority,
        dueDate: editedTask.dueDate,
      };

      if (editedTask.assignedTo) {
        updateData.assignedTo = editedTask.assignedTo;
      } else {
        updateData.assignedTo = null;
      }

      const { data } = await api.put(`/api/tasks/${taskId}`, updateData);
      setTask(data.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading || !task || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/projects/${projectId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <Link
                to={`/projects/${projectId}`}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {project.name}
              </Link>
              <h1 className="font-semibold text-gray-900">Task Details</h1>
            </div>
          </div>

          {isProjectManager && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Edit task"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset to original values
                  setEditedTask({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    assignedTo:
                      typeof task.assignedTo === "object" && task.assignedTo
                        ? task.assignedTo._id
                        : task.assignedTo,
                    dueDate: task.dueDate
                      ? new Date(task.dueDate).toISOString().split("T")[0]
                      : undefined,
                  });
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Task Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}
                >
                  {task.status.replace("-", " ")}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                Created {getTimeAgo(task.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editedTask.title || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
                className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none pb-2"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {task.title}
              </h1>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={4}
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {task.description || "No description provided."}
                  </p>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {task.assignedTo
                        ? task.assignedTo.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Task created and assigned to{" "}
                        <span className="font-medium">
                          {task.assignedTo?.name || "Unassigned"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assignee */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigned To
                </h3>
                {isEditing && isProjectManager ? (
                  <select
                    value={editedTask.assignedTo || ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        assignedTo: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}{" "}
                        {member._id === project.createdBy._id
                          ? "(Manager)"
                          : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3">
                    {task.assignedTo ? (
                      <>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-medium text-blue-700">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {task.assignedTo.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {task.assignedTo.email}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <span>Unassigned</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </h3>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedTask.dueDate || ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        dueDate: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span
                      className={
                        task.dueDate &&
                        new Date(task.dueDate) < new Date() &&
                        task.status !== "done"
                          ? "text-red-600 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Status & Priority (Edit only) */}
              {isEditing && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Status
                    </h3>
                    <select
                      value={editedTask.status}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          status: e.target.value as TaskStatus,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Priority
                    </h3>
                    <select
                      value={editedTask.priority}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          priority: e.target.value as TaskPriority,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </>
              )}

              {/* Task Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Task Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Task ID</span>
                    <span className="text-gray-700 font-mono">
                      {task._id.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-700">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-700">
                      {formatDate(task.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {!isEditing && isProjectManager && (
                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Task
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
