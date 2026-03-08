const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  searchUsers,
  acceptInvitation,
  rejectInvitation,
} = require("../controllers/projectController");

router.use(protect);

router.get("/users/search", searchUsers);

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

router.post("/:id/invite", inviteMember);
router.post("/:id/accept", acceptInvitation);
router.post("/:id/reject", rejectInvitation);
router.delete("/:id/members", removeMember);

module.exports = router;
