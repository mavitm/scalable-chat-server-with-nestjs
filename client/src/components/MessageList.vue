<template>
  <div class="message-list">
    <div class="message-scroll">
      <message-item
        v-for="(message, index) in messages"
        :key="'message-item_' + index"
        :message="message"
      />
    </div>
  </div>
</template>

<script>
import MessageItem from "@/components/MessageItem";
export default {
  name: "MessageList",
  components: { MessageItem },
  data() {
    return {
      messagePage: 1,
      dataItemLimit: 50,
    };
  },
  computed: {
    messages() {
      return this.$root.messageList;
    },
  },
  methods: {
    requestGetMessages() {
      let that = this;
      console.log("request message list");
      that.$root._send("getMessages", {
        method: "getMessages",
        params: {
          page: that.messagePage,
          limit: that.dataItemLimit,
          sort: "asc",
          sortBy: "created",
          token: that.$root.userInfo.token,
        },
        id: "getMessages",
      });
    },

    listenServerMessage(res) {
      let that = this;
      if (!Object.prototype.hasOwnProperty.call(res, "error")) {
        let isSelf = res.id.indexOf(that.$root.userInfo.id) > -1;
        that.$root.messageList.push({
          id: res.result._id,
          owner: res.result.owner,
          self: isSelf,
          content: res.result.message,
          created: res.result.created,
        });
        that.message = "";
        that.selfMessageCount += 1;
        that.setScrollPos();
      } else {
        alert(res.error.message);
      }
    },
    listenLastMessageList(res) {
      let that = this;
      if (!Object.prototype.hasOwnProperty.call(res, "error")) {
        res.result.forEach((item) => {
          that.setUserMessage(item);
        });
      }
      that.setScrollPos();
    },
    setUserMessage(message) {
      let that = this;
      let isSelf = message.user_id.indexOf(that.$root.userInfo.id) > -1;
      that.$root.messageList.push({
        id: message._id,
        owner: message.user_name,
        self: isSelf,
        content: message.content,
        created: message.created,
      });
      that.selfMessageCount += 1;
      that.message = "";
    },
    listenNotify(message) {
      let that = this;
      let content = "";
      try {
        if (message.result.type === "login") {
          content = this.$options.filters.__(":user logged into the system", {
            user: message.result.user,
          });
        } else if (message.result.type === "logout") {
          content = this.$options.filters.__(":user logged out of the system", {
            user: message.result.user,
          });
        } else {
          return;
        }
        that.$root.messageList.push({
          user_id: "-",
          _id: "_",
          user_name: message.result.user,
          content,
          created: new Date(),
          notify: true,
        });
      } catch (e) {
        console.log(e.message, message);
      }
      that.setScrollPos();
    },
    setScrollPos() {
      setTimeout(function () {
        let scrollingElement = document.querySelector(".message-scroll");
        scrollingElement.scrollTop = scrollingElement.scrollHeight;
      }, 400);
    },
  },
  mounted() {
    this.requestGetMessages();
    window.appEvent.on("message", this.listenServerMessage);
    window.appEvent.on("getMessages", this.listenLastMessageList);
    window.appEvent.on("notify", this.listenNotify);
  },
  destroyed() {
    window.appEvent.removeListener("message", this.listenServerMessage);
    window.appEvent.removeListener("getMessages", this.listenLastMessageList);
    window.appEvent.removeListener("notify", this.listenNotify);
  },
};
</script>

<style lang="scss">
.message-list {
  background-color: #ffffff;
  border-radius: 15px;
  width: calc(100% - 15px);
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  overflow: hidden;
  .message-scroll {
    position: absolute;
    width: 100%;
    height: auto;
    max-height: 100%;
    overflow-y: auto;
  }
}
</style>
