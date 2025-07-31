const jobs = require("../database/models/jobModel");

exports.postJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, requirements } = req.body;
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
  try {
    const allJobs = await jobs.find().populate("employer", "name email"); // populate employer details (name, email only)
    res.status(200).json(allJobs);
  } catch (error) {
    res.status(500).json({ error: error.message || error });
  }
};


