const Applicant = require("../database/models/applicantModel");
const job = require("../database/models/jobModel");

exports.createApplicant = async (req, res) => {
  const { job, coverLetter } = req.body;
  const applicant = req.userID;
  const resume = req.file ? req.file.filename : null;

  if (!job || !coverLetter || !resume) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await Applicant.findOne({ job, applicant });
    if (existing) {
      return res.status(409).json({ message: "Already applied to this job" });
    }

    const newApplication = new Applicant({
      job,
      applicant,
      coverLetter,
      resume,
    });

    await newApplication.save();
    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyApplications = async (req, res) => {
  const applicantId = req.userID;

  try {
    const applications = await Applicant.find({ applicant: applicantId })
      .populate("job")
      .populate("applicant", "-password"); //Minus means the pasword is give to the frontend

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//Employeer Side 
exports.getApplicantsForEmployerJobs = async (req, res) => {
  try {
    const employerId = req.userID;

    const employerJobs = await job.find({ employer: employerId });

    const jobIds = employerJobs.map((job) => job._id);

    const applications = await Applicant.find({ job: { $in: jobIds } }).populate("job").populate("applicant");

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching employer applications", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Accept application
exports.acceptApplication = async (req, res) => {
  try {
    const { id } = req.params; // Application ID
    const application = await Applicant.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "Accepted";
    await application.save();

    res.status(200).json({ message: "Application accepted successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params; 
    const application = await Applicant.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "Rejected";
    await application.save();

    res.status(200).json({ message: "Application rejected successfully", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
