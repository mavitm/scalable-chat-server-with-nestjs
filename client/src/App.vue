<template>
  <div id="app">
    <chat-main v-if="$root.isLogin" />
    <login-form v-else />
  </div>
</template>

<script>
import ChatMain from "@/components/ChatMain";
import LoginForm from "@/components/LoginForm";
export default {
  name: "App",
  components: { ChatMain, LoginForm },
};
</script>

<style lang="scss">
html {
  font-size: 15px;
}
body {
  margin: 0;
  padding: 0;
  font-family: Helvetica, sans-serif;
}
* {
  box-sizing: border-box;
  outline: none;
  text-decoration: none;
}
#app {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
