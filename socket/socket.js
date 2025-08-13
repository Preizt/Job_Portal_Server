// socket/socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

function socketHandler(server) {
  io = new Server(server, {
    cors: {
      origin: "*", 
      // change to your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  // Authenticate sockets using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    jwt.verify(token, process.env.JWTSECRETKEY, (err, decoded) => {
      if (err) return next(new Error("Invalid token"));
      socket.user = decoded; 
      // console.log(socket.user);

      next();
    });
  });

  // Handle new socket connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user?.userId || "Unknown"}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user?.userId || "Unknown"}`);
    });
  });

  console.log("Socket.IO is running successfully");
}

//Sending notification to applicant as a new job has been posted
const sendNewJobNotification = (jobData) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  // Only send to connected applicants
  io.sockets.sockets.forEach((socket) => {
    if (socket.user?.role === "applicant") {
      socket.emit("newJobPost", jobData);
    }
  });

  console.log(`New job notification sent to applicants: ${jobData.title}`);
};

module.exports = { socketHandler, sendNewJobNotification };
