const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { sequelize, Message } = require("./models");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room & send chat history
  socket.on("join_room", async (room) => {
    socket.join(room);

    const messages = await Message.findAll({
      where: { room },
      order: [["createdAt", "ASC"]],
    });

    socket.emit("chat_history", messages);
  });

  // Save & broadcast message
  socket.on("send_message", async (data) => {
    const message = await Message.create(data);
    io.to(data.room).emit("receive_message", message);
  });

  // Typing indicator
  socket.on("typing", (room) => {
    socket.to(room).emit("typing");
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

sequelize.sync().then(() => {
  server.listen(5000, () =>
    console.log("Backend running on port 5000")
  );
});

