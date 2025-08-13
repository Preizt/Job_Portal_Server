require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
require("./database/dbConnection");

const router = require("./routes/route");
const { socketHandler } = require("./socket/socket");

const jobPortalServer = express();

// Middleware
jobPortalServer.use(cors());
jobPortalServer.use(express.json());
jobPortalServer.use('/uploads', express.static('./uploads'));
jobPortalServer.use(router);

// Create HTTP server from Express
const server = http.createServer(jobPortalServer);

// Pass HTTP server to Socket.IO handler
socketHandler(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Port running successfully on ${PORT}`);
});
