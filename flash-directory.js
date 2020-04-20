module.exports = class FlashDirectory {
  constructor() {
    this.table = {};
    this.link = {};
  }

  add(id, socket) {
    if (typeof this.link[id] === "undefined") {
      this.table[socket.id] = { socket: socket };
      this.link[id] = socket.id;
      return true;
    } else {
      return false;
    }
  }

  getSocket(id) {
    // get link
    const link = this.link[id];
    return this.table[link].socket;
  }

  removeSocket(id) {
    // get link
    delete this.table[id];

    for (const key in this.link) {
      if (this.link.hasOwnProperty(key) && this.link[key] === id) {
        delete this.link[key];
        break;
      }
    }
  }
};
