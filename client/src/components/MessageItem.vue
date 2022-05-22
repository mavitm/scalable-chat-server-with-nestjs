<template>
  <div class="message-item" :class="itemCss">
    <p class="item-owner" v-if="!isNotfy">
      <strong>{{ message.owner }}</strong>
    </p>
    <p class="item-content">{{ message.content }}</p>
    <p class="item-date" v-if="!isNotfy">
      <small>{{ message.created }}</small>
    </p>
  </div>
</template>

<script>
export default {
  name: "MessageItem",
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  computed: {
    itemCss() {
      let css = {};
      if (this.message.self) {
        css["self-message"] = true;
      }
      if (this.isNotfy) {
        css["notify"] = true;
      }
      return css;
    },
    isNotfy() {
      return Object.prototype.hasOwnProperty.call(this.message, "notify");
    },
  },
};
</script>

<style lang="scss">
.message-item {
  border-radius: 15px;
  margin: 10px;
  padding: 15px;
  background-color: #ebebeb;
  border: 1px solid #cccccc;
  &.self-message {
    background-color: #168555;
    border: none;
    color: #ffffff;
  }
  &.notify {
    background-color: #1f3864;
    color: #ffffff;
    width: 70%;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }
  p {
    padding: 0;
    margin: 0;
    &.item-owner {
      font-size: 1.2rem;
      font-weight: bold;
    }
    &.item-content {
      padding: 10px 0;
    }
    &.item-date {
      text-align: right;
      font-size: 0.8rem;
    }
  }
}
</style>
