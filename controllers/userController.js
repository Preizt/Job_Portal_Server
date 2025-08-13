const users = require("../database/models/userModel");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      const token = jwt.sign(
        { userId: existingUser._id, role: existingUser.role },
        process.env.JWTSECRETKEY
      );

      res.status(200).json({ UserDetail: existingUser, jwttoken: token });
    } else {
      res.status(409).json({ Message: "Invalid Username or Password" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let existingUser = await users.findOne({ email });

    if (!existingUser) {
      // default role is 'applicant' for Google users (or change if needed)
      existingUser = new users({
        name,
        email,
        role: "applicant",
        password: "", // leave blank or handle separately
      });
      await existingUser.save();
    }

    // Create your own JWT
    const jwtToken = jwt.sign(
      { userId: existingUser._id, role: existingUser.role },
      process.env.JWTSECRETKEY
    );

    res.status(200).json({
      UserDetail: existingUser,
      jwttoken: jwtToken,
    });
  } catch (error) {
    // console.error("Google login error", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await users.findById(req.userID);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch user data" });
  }
};
