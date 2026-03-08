const Project = require("../models/Project");
const User = require("../models/User");

// Get all projects for logged in user (including pending invitations)
exports.getProjects = async (req, res) => {
  try {
    // Get projects where user is member or creator
    const memberProjects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    // Get projects where user has pending invitation
    const invitedProjects = await Project.find({
      "invitations.user": req.user._id,
      "invitations.status": "pending",
    }).populate("createdBy", "name email");

    res.json({
      success: true,
      data: {
        projects: memberProjects,
        invitations: invitedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || "#3B82F6",
      createdBy: req.user._id,
      members: [req.user._id],
      invitations: [],
    });

    await project.populate("createdBy members", "name email");

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .populate("invitations.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is member
    const isMember =
      project.members.some(
        (m) => m._id.toString() === req.user._id.toString(),
      ) || project.createdBy._id.toString() === req.user._id.toString();

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this project" });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite member (creates pending invitation)
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Only creator can invite
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only project manager can invite members" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    // Check if already invited
    const existingInvitation = project.invitations.find(
      (inv) =>
        inv.user.toString() === user._id.toString() && inv.status === "pending",
    );
    if (existingInvitation) {
      return res
        .status(400)
        .json({ message: "User already has a pending invitation" });
    }

    project.invitations.push({
      user: user._id,
      status: "pending",
    });

    await project.save();
    await project.populate("invitations.user", "name email");

    res.json({
      success: true,
      message: "Invitation sent",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const invitation = project.invitations.find(
      (inv) =>
        inv.user.toString() === req.user._id.toString() &&
        inv.status === "pending",
    );

    if (!invitation) {
      return res.status(404).json({ message: "No pending invitation found" });
    }

    invitation.status = "accepted";
    project.members.push(req.user._id);
    await project.save();

    await project.populate("createdBy", "name email");
    await project.populate("members", "name email");

    res.json({
      success: true,
      message: "Invitation accepted",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject invitation
exports.rejectInvitation = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const invitation = project.invitations.find(
      (inv) =>
        inv.user.toString() === req.user._id.toString() &&
        inv.status === "pending",
    );

    if (!invitation) {
      return res.status(404).json({ message: "No pending invitation found" });
    }

    invitation.status = "rejected";
    await project.save();

    res.json({
      success: true,
      message: "Invitation rejected",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only project manager can remove members" });
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();
    await project.populate("members", "name email");

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email")
      .limit(10);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy members", "name email");

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await project.deleteOne();
    res.json({ success: true, message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
