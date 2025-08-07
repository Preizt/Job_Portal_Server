const Applicant = require("../database/models/applicantModel");

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
      .populate("job")                          // ✅ Populates job details
      .populate("applicant", "-password");     // ✅ Populates applicant/user details, excluding password

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

