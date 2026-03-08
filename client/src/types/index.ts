export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Invitation {
  user: User;
  status: "pending" | "accepted" | "rejected";
  invitedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  createdBy: User;
  members: User[];
  invitations: Invitation[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "backlog" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: User;
  project: string;
  dueDate?: string;
  order: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
