import Job from "../database/models/jobModel.js";
import Application from "../database/models/applicantModel.js";

export const getEmployerDashboardStats = async (req, res) => {
  try {
    const employerId = req.userID; // from JWT

    // Count total jobs posted by this employer
    const totalJobPosts = await Job.countDocuments({ employer: employerId });

    // Get all job IDs posted by this employer
    const employerJobs = await Job.find({ employer: employerId }).select("_id");

    const jobIds = employerJobs.map((job) => job._id);

    // Count total applications for these jobs
    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });

    // Count pending applications
    const pendingApplications = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Pending",
    });

    res.json({
      totalJobPosts,
      totalApplications,
      pendingApplications,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyApplications = async (req, res) => {
  try {
    const employerId = req.userID;

    
    const jobs = await Job.find({ employer: employerId }).select("_id");
    const jobIds = jobs.map((job) => job._id);

   
    const applicationsByMonth = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: { month: { $month: "$appliedAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const chartData = months.map((name, index) => {
      const found = applicationsByMonth.find((a) => a._id.month === index + 1);
      return { name, Applications: found ? found.total : 0 };
    });

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

