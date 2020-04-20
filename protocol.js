const FlashDirectory = require("./flash-directory");

module.exports = class MessagingProtocol {
  constructor() {
    // create new flash directory
    this.flashDirectory = new FlashDirectory();
  }

  handleIntent(message, socket) {
    // decode incoming message
    const decodedMessage = this.decode(message);

    // ping reciever
    const ping = this.ping(decodedMessage.body);

    if (ping.status === "success") {
      // Proceed to check intent of the message
      if (decodedMessage.hasOwnProperty("intent")) {
        switch (decodedMessage.intent) {
          case "p2p-message":
            this.p2p(ping.socket, { type: "message", ...decodedMessage.body });
            break;

          case "p2p-ack":
            this.p2p(ping.socket, { type: "ack", ...decodedMessage.body });
            break;

          default:
            break;
        }
      }
    } else if (ping.status === "failed") {
      // alert sender of reciever's offline status
      socket.emit("messageError", {
        type: "error",
        message: "Reciever not found"
      });
    }
  }

  p2p(r_socket, message) {
    try {
      // send message to reciever
      r_socket.socket.emit(message.type, this.encode(message));
    } catch (error) {
      console.log(error);
    }
  }

  encode(message) {
    return JSON.stringify(message);
  }

  decode(message) {
    if (typeof message === "string") {
      return JSON.parse(message);
    } else {
      throw new Error(
        "Unable ot decode message. Message must be of type string"
      );
    }
  }

  addToFlashDirectory(id, socket) {
    const results = this.flashDirectory.add(id, socket);
    return results;
  }

  removeFromFlashDirectory(id) {
    this.flashDirectory.removeSocket(id);
  }

  ping(message) {
    try {
      // try resolving the uuid then socket connection
      const uuid = message.reciever_uuid ? message.reciever_uuid : null;
      const r_socket = this.resolve(uuid);

      return typeof r_socket === "undefined"
        ? {
            status: "failed",
            socket: null
          }
        : {
            status: "success",
            socket: r_socket
          };
    } catch (error) {
      console.log(error);
    }
  }

  resolve(uuid) {
    const id = this.flashDirectory.link[uuid];
    const snapshot = this.flashDirectory.table;

    return snapshot[id];
  }
};
