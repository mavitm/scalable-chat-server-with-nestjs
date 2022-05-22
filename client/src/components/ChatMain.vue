<template>
  <div id="app-main">
    <div class="user-info">
      <h1><span>Hi!</span> {{ $root.userInfo.name }}</h1>
    </div>
    <div class="c-row">
      <div class="col-messages"><message-list /></div>
      <div class="col-userlist"><user-list /></div>
    </div>
    <message-form />
  </div>
</template>

<script>
import MessageList from "@/components/MessageList";
import MessageForm from "@/components/MessageForm";
import UserList from "@/components/UserList";
export default {
  name: "ChatMain",
  components: { MessageList, MessageForm, UserList },
};
</script>

<style lang="scss">
#app-main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: flex-start;
  padding: 30px;
  background: #2980b9;
  .user-info {
    position: absolute;
    width: auto;
    height: auto;
    padding: 15px;
    background-color: #265285;
    color: #ffffff;
    border-radius: 0 0 10px 10px;
    top: 30px;
    left: 60px;
    z-index: 9999;
    h1 {
      padding: 0;
      margin: 0;
      font-size: 1.3rem;
    }
  }
  .c-row {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: flex-start;
    width: 100%;
    height: 100%;
    .col-messages {
      width: 80%;
      height: 100%;
    }
    .col-userlist {
      width: 20%;
      height: 100%;
    }
  }
}
</style>
