const express = require("express");

const router = express.Router();

//Middleware for verification and multimedia upload 
const jwt = require("../middleware/jwtmiddleware");
const multer = require("../middleware/multer");


const userController = require("../controllers/userController");
const jobController = require("../controllers/jobController");
const applicantController = require("../controllers/applicantController")
const employerDashController = require("../controllers/employerDashControlller")

// Authentication
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Google Auth
router.post("/auth/google", userController.googleLogin);

router.get("/user", jwt, userController.getUser);

//Employee CRUD Section
router.post("/postjob", jwt, multer.single("image"), jobController.postJob);
router.get("/alljobpost",jwt,jobController.getPostJobDetails);
router.delete("/job/:id", jwt, jobController.deleteJobPost);
router.put("/job/:id", jwt, multer.single("image"), jobController.editJobPost);

//SinglePostViewEmployerSide
router.get("/job/:id",jobController.singlePostView);

//Applicant Side
router.get("/alljob",jobController.getAllJobs)
router.post("/job", jwt, jobController.saveJob);
router.get("/job",jwt,jobController.getSavedJobs)
router.patch("/job/:id", jwt, jobController.removeSavedJob);


//Application Side
router.post("/apply",jwt, multer.single("resume"),applicantController.createApplicant);
router.get("/applications",jwt,applicantController.getMyApplications)

//Employee Application Side
router.get("/jobapplication",jwt,applicantController.getApplicantsForEmployerJobs)


//Accept and Reject
router.patch("/application/:id", applicantController.acceptApplication);
router.patch("/rejectapplication/:id", applicantController.rejectApplication);

//Employer Dasboard 

router.get("/employer/stats", jwt,employerDashController.getEmployerDashboardStats );
router.get("/employer/chart", jwt,employerDashController.getMonthlyApplications );
    
module.exports = router;
    