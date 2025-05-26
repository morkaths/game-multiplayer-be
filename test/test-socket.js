import ioClient from "socket.io-client";
const socket = ioClient("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("test-event", { msg: "Hello from Node.js client!" });

  socket.on("test-response", (data) => {
    console.log("Test response:", data);
  });

  socket.emit("join-room", { pin: "123456", player: { name: "NodePlayer" } });

  socket.on("player-joined", (data) => {
    console.log("Player joined:", data);
  });
});
