/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { DragEndEvent } from "@dnd-kit/core";
import type { DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  Users,
  Search,
  User as UserIcon,
  GripVertical,
  Trash2,
  LogOut,
} from "lucide-react";
import api from "../services/api";
import type { Project, Task, TaskStatus, TaskPriority, User } from "../types";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "bg-gray-500" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

const TaskCard = ({
  task,
  isOverlay,
  onClick,
}: {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition group ${
        isDragging || isOverlay ? "opacity-50 rotate-2 shadow-xl" : ""
      } ${isOverlay ? "opacity-100 rotate-0 cursor-grabbing" : "cursor-pointer"}`}
      {...attributes}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <button
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </button>
          <h4 className="font-medium text-gray-900 line-clamp-2">
            {task.title}
          </h4>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {task.assignedTo ? (
          <div
            className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700"
            title={task.assignedTo.name}
          >
            {task.assignedTo.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <UserIcon className="w-4 h-4 text-gray-300" />
        )}
      </div>
    </div>
  );
};

const Column = ({
  id,
  title,
  color,
  tasks,
  projectId,
}: {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  projectId: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const navigate = useNavigate();

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-80 min-w-[320px] bg-gray-50 rounded-xl transition-colors ${
        isOver ? "bg-gray-100 ring-2 ring-blue-400 ring-inset" : ""
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 min-h-[200px]">
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => {
                navigate(`/projects/${projectId}/tasks/${task._id}`);
              }}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectBoard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    status: "backlog" as TaskStatus,
    assignedTo: "",
    dueDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks?projectId=${id}`),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      navigate("/projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // FIX: Properly get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      const userData = JSON.parse(userStr);

      if (userData._id) return userData._id;
      if (userData.id) return userData.id;
      if (userData.user?._id) return userData.user._id;
      if (userData.user?.id) return userData.user.id;
      if (userData.data?._id) return userData.data._id;
      if (userData.data?.id) return userData.data.id;
      if (userData.data?.user?._id) return userData.data.user._id;

      return null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Also try to get from token if available
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // Decode JWT payload (middle part)
      const base64Payload = token.split(".")[1];
      if (!base64Payload) return null;

      const payload = JSON.parse(atob(base64Payload));
      return payload.id || payload.userId || payload._id || payload.sub || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Use token user ID as fallback
  const effectiveUserId = currentUserId || getUserFromToken();

  // Handle both populated object and string ID for createdBy
  const isProjectManager =
    project && effectiveUserId
      ? typeof project.createdBy === "object" && project.createdBy !== null
        ? project.createdBy._id === effectiveUserId
        : project.createdBy === effectiveUserId
      : false;

  // Only project managers can search and invite members
  const searchUsers = async (query: string) => {
    if (!isProjectManager) {
      return;
    }

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await api.get(
        `/api/projects/users/search?query=${query}`,
      );
      const existingIds = project?.members.map((m) => m._id) || [];
      const invitedIds =
        project?.invitations
          ?.filter((inv) => inv.status === "pending")
          .map((inv) => inv.user._id) || [];

      const resultsWithStatus = data.data.map((u: User) => ({
        ...u,
        isAlreadyMember: existingIds.includes(u._id),
        isAlreadyInvited: invitedIds.includes(u._id),
      }));
      setSearchResults(resultsWithStatus);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Only project managers can invite members
  const inviteMember = async (userId: string) => {
    if (!isProjectManager) {
      alert("Only project managers can invite members");
      return;
    }

    try {
      const user = searchResults.find((u) => u._id === userId);
      if (!user) return;
      await api.post(`/api/projects/${id}/invite`, { email: user.email });
      fetchData();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to invite member");
    }
  };

  // Only project managers can remove members
  const removeMember = async (userId: string) => {
    if (!isProjectManager) {
      alert("Only project managers can remove members");
      return;
    }

    try {
      await api.delete(`/api/projects/${id}/members`, { data: { userId } });
      fetchData();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  // All members can create tasks
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData: any = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        project: id,
      };
      if (newTask.assignedTo) {
        taskData.assignedTo = newTask.assignedTo;
      }
      if (newTask.dueDate) {
        taskData.dueDate = newTask.dueDate;
      }

      const { data } = await api.post("/api/tasks", taskData);
      setTasks([...tasks, data.data]);
      setShowCreateModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        status: "backlog",
        assignedTo: "",
        dueDate: "",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const isColumn = COLUMNS.some((col) => col.id === overId);

    if (isColumn) {
      const newStatus = overId as TaskStatus;
      if (activeTask.status !== newStatus) {
        await updateTaskStatus(activeTask._id, newStatus);
      }
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask && activeTask.status === overTask.status) {
        const columnTasks = tasks.filter((t) => t.status === activeTask.status);
        const oldIndex = columnTasks.findIndex((t) => t._id === active.id);
        const newIndex = columnTasks.findIndex((t) => t._id === over.id);
        const newColumnTasks = arrayMove(columnTasks, oldIndex, newIndex);
        const newTasks = tasks.map((t) => {
          if (t.status !== activeTask.status) return t;
          const idx = newColumnTasks.findIndex((nt) => nt._id === t._id);
          return { ...t, order: idx };
        });
        setTasks(newTasks);
      } else if (overTask) {
        await updateTaskStatus(activeTask._id, overTask.status);
      }
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t)),
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: project.color }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-gray-900">
                    {project.name}
                  </h1>
                  {isProjectManager && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      Manager
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  {project.members.length} members
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* All members can add tasks */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={tasks
                  .filter((t) => t.status === column.id)
                  .sort((a, b) => a.order - b.order)}
                projectId={id!}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Create Task Modal - Available to all members */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignedTo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {project.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}{" "}
                      {member._id ===
                      (typeof project.createdBy === "object"
                        ? project.createdBy._id
                        : project.createdBy)
                        ? "(Manager)"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal - Only Manager can invite */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Project Members
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invite Member - Only for Manager */}
            {isProjectManager ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite by Email or Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search by email or name..."
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {searchResults.map((user: any) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        {user.isAlreadyMember ? (
                          <span className="text-xs text-gray-400 font-medium">
                            Member
                          </span>
                        ) : user.isAlreadyInvited ? (
                          <span className="text-xs text-yellow-600 font-medium">
                            Invited
                          </span>
                        ) : (
                          <button
                            onClick={() => inviteMember(user._id)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Invite
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <p className="text-sm text-gray-500 mt-2">Searching...</p>
                )}
                {!isSearching &&
                  searchQuery.length >= 2 &&
                  searchResults.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No users found</p>
                  )}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Only the project manager can invite new members.
                </p>
              </div>
            )}

            {/* Pending Invitations - Only for Manager */}
            {isProjectManager &&
              project.invitations?.filter((inv) => inv.status === "pending")
                .length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Pending Invitations
                  </h3>
                  <div className="space-y-2">
                    {project.invitations
                      .filter((inv) => inv.status === "pending")
                      .map((invitation) => (
                        <div
                          key={invitation.user._id}
                          className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm font-medium text-yellow-700">
                              {invitation.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {invitation.user.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {invitation.user.email}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-yellow-600 font-medium">
                            Pending
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Current Members */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Current Members
              </h3>
              <div className="space-y-2">
                {project.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {member.name}
                          </p>
                          {member._id ===
                            (typeof project.createdBy === "object"
                              ? project.createdBy._id
                              : project.createdBy) && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              Manager
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    {isProjectManager &&
                      member._id !==
                        (typeof project.createdBy === "object"
                          ? project.createdBy._id
                          : project.createdBy) && (
                        <button
                          onClick={() => removeMember(member._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
