<template>
  <div class="message-form">
    <input
      type="text"
      class="mssage-text"
      :placeholder="'message' | _"
      v-model="message"
      @keyup.enter="sendMessage"
    />
    <button
      class="btn btn-msg-button"
      type="button"
      :disabled="btnDisable"
      @click="sendMessage"
    >
      {{ "send" | _ }}
    </button>
  </div>
</template>

<script>
export default {
  name: "MessageForm",
  data() {
    return {
      message: "",
      selfMessageCount: 0,
    };
  },
  computed: {
    btnDisable() {
      return this.message.trim().length < 1;
    },
    makeMessageId() {
      return this.selfMessageCount + "_message_" + this.$root.userInfo.id;
    },
  },
  methods: {
    sendMessage() {
      let that = this;
      if (that.message.trim().length < 1) {
        that.message = "";
        return;
      }
      this.$root
        .sendMessage({
          method: "message",
          id: this.makeMessageId,
          params: {
            message: that.message,
            token: this.$root.userInfo.token,
          },
        })
        .then(() => {
          that.message = "";
        });
    },
  },
};
</script>

<style lang="scss">
.message-form {
  padding: 15px;
  background-color: #ffffff;
  border-radius: 15px;
  margin-top: 15px;
  display: flex;
  flex-wrap: nowrap;
  .mssage-text {
    border: 1px solid #bdbfbd;
    padding: 10px 15px;
    width: 100%;
    border-radius: 10px;
    font-size: 1.5rem;
  }
  .btn-msg-button {
    border: none;
    background: #265285;
    width: auto;
    border-radius: 10px;
    padding: 15px;
    color: #ffffff;
    cursor: pointer;
    transition: all 300ms linear;
    margin-left: 15px;
    &:hover {
      background: #2c914e;
    }
    &:disabled {
      background-color: #ccc;
    }
  }
}
</style>
