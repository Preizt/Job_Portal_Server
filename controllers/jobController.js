const jobs = require("../database/models/jobModel");

exports.postJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, requirements } =
      req.body;
    const employerId = req.userID; // from JWT middleware
    const userRole = req.role; // from JWT middleware

    // 1. Role check: Only employers can post
    if (userRole !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs." });
    }

    // 2. Image check
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = req.file.filename;

    // 3. Prevent duplicate jobs
    const existingJob = await jobs.findOne({ title, company });

    if (existingJob) {
      return res.status(409).json("Job Already Exists");
    }

    // 4. Create job
    const newJob = new jobs({
      title,
      description,
      company,
      location,
      salary,
      requirements,
      employer: employerId,
      image,
    });

    await newJob.save();
    res.status(201).json({ newJob });
  } catch (error) {
    res.status(500).json({ Error: error.message || error });
  }
};

// exports.getPostJobDetails = async (req, res) => {
//   try {
//     const employerId = req.userID; // 👈 extracted from token middleware

//     const jobsByEmployer = await jobs
//       .find({ employer: employerId }) // 👈 only their jobs
//       .populate("employer", "name email");

//     res.status(200).json(jobsByEmployer);
//   } catch (error) {
//     res.status(500).json({ error: error.message || error });
//   }
// };


exports.deleteJobPost = async (req, res) => {
  try {
    const jobId = req.params.id;
    const employerId = req.userID; // Assuming JWT middleware sets this

    // Check if the job exists and is owned by the logged-in employer
    const job = await jobs.findOne({ _id: jobId, employer: employerId });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    await jobs.findByIdAndDelete(jobId);

    res.status(200).json({ message: "Job deleted successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message || error });
  }
};

exports.editJobPost = async (req, res) => {
  try {
    const jobId = req.params.id;
    const employerId = req.userID; // From JWT middleware
    const updatedData = req.body;

    // Check if the job exists and is owned by the logged-in employer
    const job = await jobs.findOne({ _id: jobId, employer: employerId });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    // Update job with new data
    const updatedJob = await jobs.findByIdAndUpdate(jobId, updatedData, {
      new: true, // return the updated document
    });

    res.status(200).json({
      message: "Job updated successfully",
      updatedJob,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || error });
  }
};
