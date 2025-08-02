const jwt = require("jsonwebtoken");

const jsonVerify = (req, res, next) => {
  console.log(req.headers["authorization"]);

  if (req.headers["authorization"]) {
    try {
      let token = req.headers["authorization"].split(" ")[1];

      let jwtResponse = jwt.verify(token, process.env.JWTSECRETKEY);
      req.userID = jwtResponse.userId;
      req.role = jwtResponse.role;
      next();

      // console.log(jwtResponse);
      console.log(token);
    } catch (err) {
      res.status(403).json(`Please provide a valid token`);
    }
  } else {
    res.status(401).json("Please Login");
  }
};

module.exports = jsonVerify;
