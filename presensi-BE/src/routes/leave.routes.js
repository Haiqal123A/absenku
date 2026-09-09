const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);
router.get("/", leaveController.getMine);
router.post("/", leaveController.create);

module.exports = router;
