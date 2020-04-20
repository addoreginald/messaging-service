const io = require("socket.io");
const Protocol = require("./protocol");

// init Messaging protocol
const protocol = new Protocol();

// start server
const server = io.listen(3001);

server.on("connection", socket => {
  socket.once("subscribe", message => {
    try {
      const parsedMessage = protocol.decode(message);
      const subscription = protocol.addToFlashDirectory(parsedMessage.uuid, socket);

      socket.emit(
        "subscribed",
        protocol.encode({
          status: subscription ? "success" : "failed",
          data: {
            message: subscription
              ? "uuid bound successfuly"
              : "uuid has already been bound"
          }
        })
      );
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  // set up messaging and ack listener
  socket.on("message", message => {
    try {
      // handle intent
      protocol.handleIntent(message, socket);
    } catch (error) {
      // error response
      socket.emit("messageError", error.message);
    }
  });

  socket.on("ack", message => {
    try {
      // handle intent
      protocol.handleIntent(message, socket);
    } catch (error) {
      // error response
      socket.emit("messageError", error.message);
    }
  });

  socket.once("disconnect", () => {
    protocol.removeFromFlashDirectory(socket.id);
  });
});
