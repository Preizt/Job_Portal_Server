const express = require("express");

const router = express.Router();

const jwt = require("../middleware/jwtmiddleware");
const multer = require("../middleware/multer");

const userController = require("../controllers/userController");
const jobController = require("../controllers/jobController");

// Authentication
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

//Employee CRUD Section
router.post("/postjob", jwt, multer.single("image"), jobController.postJob);
router.get("/alljobpost", jobController.getPostJobDetails);

module.exports = router;
