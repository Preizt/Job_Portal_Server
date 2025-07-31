require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./database/dbConnection");

const jobPortalServer = express();
const router = require("./routes/route");

jobPortalServer.use(cors());

jobPortalServer.use(express.json());
jobPortalServer.use(router);

const PORT = 3000 || process.env.PORT;

jobPortalServer.listen(PORT, () => {
  console.log(`Port running successfully on ${PORT}`);
});
