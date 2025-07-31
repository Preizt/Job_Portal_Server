const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    // Link to the employer who created the job
    
  },
  time: {
    type: Date,
    default: Date.now,
  },
  image: {
  type: String,
  required: true,
}
});

const job = mongoose.model("jobs", jobSchema);
module.exports = job;
