import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static("public"));

let checkboxState = {};

io.on("connection", (socket) => {
  socket.emit("initial-state", checkboxState);

  socket.on("checkbox-changed", (data) => {
    if (data.state) {
      checkboxState[data.id] = { state: data.state, username: data.username };
    } else {
      delete checkboxState[data.id];
    }
    socket.broadcast.emit("update", data);
  });

  socket.on("admin-reset", (password) => {
    if (password === process.env.ADMIN_PASS) {
      checkboxState = {};
      io.emit("reset");
    } else {
      socket.emit("reset-failed");
    }
  });
});

server.listen(PORT, () => {
});
