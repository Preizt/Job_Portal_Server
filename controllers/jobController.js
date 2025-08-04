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

exports.getPostJobDetails = async (req, res) => {
  let { search } = req.query;
  const employerId = req.userID; // extracted from token middleware

  try {
    // Base query to filter jobs posted by this employer
    let query = { employer: employerId };

    // If a search term is provided, match job titles case-insensitively
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Fetch jobs and populate employer details
    const jobsByEmployer = await jobs
      .find(query)
      .populate("employer", "name email");

    console.log(jobsByEmployer);

    res.status(200).json(jobsByEmployer);
  } catch (error) {
    res.status(500).json({ error: error.message || error });
  }
};

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

exports.singlePostView = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobs.findById({ _id: id });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const alljobs = await jobs.find();
    res.status(200).json(alljobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch jobs", error: error.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: "Job already saved" });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.status(200).json({ message: "Job saved successfully" });
  } catch (err) {
    console.error("Save Job Error:", err);
    res.status(500).json({ message: "Server error while saving job" });
  }
};
