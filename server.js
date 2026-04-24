import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static("public"));

let checkboxState = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  checkboxState = {};
  
  io.emit("reset");

  socket.on("checkbox-changed", (data) => {
    console.log(`${data.id} changed to ${data.state} by ${data.username}`);
    
    if (data.state) {
      checkboxState[data.id] = { state: data.state, username: data.username };
    } else {
      delete checkboxState[data.id];
    }

    socket.broadcast.emit("update", data);
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
