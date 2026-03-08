const Task = require("../models/Task");
const Project = require("../models/Project");

// Get all tasks for user
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    // Get projects user has access to
    const userProjects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).select("_id");

    const projectIds = userProjects.map((p) => p._id.toString());

    let query = { project: { $in: projectIds } };
    if (projectId) query.project = projectId;

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("project", "name color")
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      project,
      assignedTo,
      dueDate,
    } = req.body;

    // Check project access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember =
      projectDoc.members.includes(req.user._id) ||
      projectDoc.createdBy.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get max order for status
    const maxOrderTask = await Task.findOne({
      project,
      status: status || "backlog",
    }).sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status: status || "backlog",
      priority: priority || "medium",
      project,
      assignedTo,
      dueDate,
      order,
    });

    await task.populate("assignedTo", "name email");

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access
    const project = await Project.findById(task.project);
    const isMember =
      project.members.includes(req.user._id) ||
      project.createdBy.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name email");

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status (for drag and drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, order } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order },
      { new: true },
    ).populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const isMember =
      project.members.includes(req.user._id) ||
      project.createdBy.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.deleteOne();
    res.json({ success: true, message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("project", "name color createdBy");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user has access
    const Project = require("../models/Project");
    const project = await Project.findById(task.project);
    const isMember =
      project.members.includes(req.user._id) ||
      project.createdBy.toString() === req.user._id.toString();

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
