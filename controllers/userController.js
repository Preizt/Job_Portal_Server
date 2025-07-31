const users = require("../database/models/userModel");
const jwt  =require('jsonwebtoken')

exports.registerUser = async (req, res) => {
  const { name, role, email, password } = req.body;
  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      res.status(409).json({ MessageFromServer: existingUser });
    } else {
      const newUser = new users({ name, role, email, password });
      await newUser.save();
      res.status(201).json(newUser);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let existingUser = await users.findOne({ email, password });
    if (existingUser) {
      const token = jwt.sign({ userId: existingUser._id,role: existingUser.role },process.env.JWTSECRETKEY);

      res.status(200).json({ UserDetail: existingUser, jwttoken: token });
    } else {
      res.status(409).json({ Message: "Invalid Username or Password" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

