//Server-side

const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
app.use(cors());

const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    console.log("New User", name);
    users[socket.id] = name;
    socket.broadcast.emit("User-joined", name);
  });

  socket.on("send-message", (message) => {
    console.log("Message received:", message);
    io.emit("receive-message", { name: users[socket.id], message: message });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    socket.broadcast.emit("User-left", users);
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
