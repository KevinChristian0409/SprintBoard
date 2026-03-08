const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTask,
} = require("../controllers/taskController");

router.use(protect);

router.route("/").get(getTasks).post(createTask);

router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

router.patch("/:id/status", updateTaskStatus);

module.exports = router;
