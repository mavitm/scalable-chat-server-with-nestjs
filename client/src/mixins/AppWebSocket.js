const io = require("socket.io-client");

const appWebSocket = {
  data: function () {
    return {
      socket: null,
      socketConnected: false,
      wsListener: {},
      socketPromiseQueue: {},
      socketPromiseTimeout: 15000,
      idEventPrefix: "SOCKETID_",
    };
  },
  methods: {
    ws_connection() {
      if (this.socketConnected) {
        return;
      }
      this.socket = io.connect("ws://localhost:3000", {
        transports: ["websocket"],
      });
      this.socket.on("connect", this.ws_connected.bind(this));
      this.socket.on("disconnect", this.ws_disconnected.bind(this));
      this.socket.on("reconnect", this.ws_reconnect.bind(this));
      this.socket.on("message", this.ws_dispatcher.bind(this));
      this.socket.on("login", this.ws_dispatcher.bind(this));
      this.socket.on("register", this.ws_dispatcher.bind(this));
      this.socket.on("getUsers", this.ws_dispatcher.bind(this));
      this.socket.on("setFriend", this.ws_dispatcher.bind(this));
      this.socket.on("getMessages", this.ws_dispatcher.bind(this));
      this.socket.on("notify", this.ws_dispatcher.bind(this));
    },
    ws_connected() {
      console.log("socket connected");
      this.socketConnected = true;
      window.appEvent.emit("socket_connected");
    },
    ws_disconnected() {
      console.log("socket disconnected");
      this.socketConnected = false;
      window.appEvent.emit("socket_disconnected");
    },
    ws_reconnect() {
      console.log("socket reconnect");
    },
    ws_dispatcher(payload = {}) {
      if (typeof payload !== "object") {
        payload = JSON.parse(payload);
      }
      console.log("DISPATCHER", payload);
      if (Object.prototype.hasOwnProperty.call(payload, "method")) {
        window.appEvent.emit(payload.method, payload);
      }
      if (Object.prototype.hasOwnProperty.call(payload, "id")) {
        window.appEvent.emit(this.idEventPrefix + payload.id, payload);
      }
    },
    sendMessage(data) {
      return this._send("message", data);
    },
    sendLoginRequest(data) {
      return this._send("login", data);
    },
    sendRegisterRequest(data) {
      return this._send("register", data);
    },
    _send(endpoint, data, option = {}) {
      this.socket.emit(endpoint, data);

      if (Object.prototype.hasOwnProperty.call(data, "id")) {
        this.socketPromiseQueue[this.idEventPrefix + data.id] =
          this.ws_promise();
        window.appEvent.on(
          this.idEventPrefix + data.id,
          this.ws_promise_resolver
        );

        if (!Object.prototype.hasOwnProperty.call(option, "timeout")) {
          option.timeout = this.socketPromiseTimeout;
        }
        this.setSocketResponseTimeOut(
          this.idEventPrefix + data.id,
          option.timeout
        );
        return this.socketPromiseQueue[this.idEventPrefix + data.id];
      }
      return Promise.resolve(data);
    },
    ws_promise(handler = function () {}) {
      let rResolve, rReject;
      let promise = new Promise(function (resolve, reject) {
        rResolve = resolve;
        rReject = reject;
        try {
          handler(resolve, reject);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      });
      promise.resolve = rResolve;
      promise.reject = rReject;
      return promise;
    },
    ws_promise_resolver(data) {
      let socketID = "";
      if (Object.prototype.hasOwnProperty.call(data, "id")) {
        socketID = this.idEventPrefix + data.id;
        if (
          Object.prototype.hasOwnProperty.call(
            this.socketPromiseQueue,
            socketID
          )
        ) {
          this.socketPromiseQueue[socketID].resolve(data);
          window.appEvent.removeListener(socketID, this.ws_promise_resolver);
          delete this.socketPromiseQueue[socketID];
        }
      }
    },
    setSocketResponseTimeOut(key, timeOut) {
      let that = this;
      if (!Object.prototype.hasOwnProperty.call(that.socketPromiseQueue, key)) {
        return;
      }
      setTimeout(function () {
        try {
          window.appEvent.removeListener(key, that.ws_promise_resolver);
          if (typeof that.socketPromiseQueue[key] !== "undefined") {
            that.socketPromiseQueue[key].resolve({
              error: {
                code: 500,
                message: "client-side timeout",
              },
              id: key.replace(that.idEventPrefix, ""),
            });
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
        delete that.socketPromiseQueue[key];
      }, timeOut);
    },
    ws_disconnect() {
      if (!this.socketConnected) {
        return;
      }
      this.socket.disconnect();
    },
  },

  created() {
    // this.socket = io.connect("http://localhost:3000");
    // this.socket.on("connect", function () {
    //   console.log("socket connected");
    // });
  },
};

export { appWebSocket };
