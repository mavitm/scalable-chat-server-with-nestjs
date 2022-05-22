<template>
  <form id="login-form">
    <div class="form-inputs">
      <h1 class="login-header" :class="headerCss" v-if="formType === 'login'">
        {{ "LOGIN FORM" | _ }}
      </h1>
      <h1
        class="login-header"
        :class="headerCss"
        v-if="formType === 'register'"
      >
        {{ "REGISTER FORM" | _ }}
      </h1>
      <div class="login-main" v-if="viewForm">
        <p class="error-text" v-if="hasError">{{ errorTextView }}</p>
        <div class="form-group">
          <label>{{ "E-mail" | _ }}</label>
          <input
            type="text"
            class="form-control"
            :placeholder="'yourname@host.ex' | _"
            v-model="email"
          />
        </div>
        <div class="form-group">
          <label>{{ "Password" | _ }}</label>
          <input
            type="password"
            class="form-control"
            placeholder="******"
            autocomplete="off"
            v-model="password"
          />
        </div>
        <button
          type="button"
          class="btn login-button"
          v-if="formType === 'login'"
          @click="connectToSocket"
        >
          {{ "LOGIN" | _ }}
        </button>
        <div class="register" v-if="formType === 'register'">
          <div class="form-group">
            <label>{{ "Name" | _ }}</label>
            <input type="text" class="form-control" v-model="name" />
          </div>
          <button
            type="button"
            class="btn login-button"
            @click="connectToSocket"
          >
            {{ "Register and login" | _ }}
          </button>
        </div>
      </div>

      <div class="login-loader" v-if="!viewForm">
        <p class="animated jello infinite">-[]-</p>
        <p class="animated flash infinite">{{ "Connection..." | _ }}</p>
      </div>
      <div class="login-footer" v-if="viewForm">
        <span
          class="a-type"
          v-if="formType === 'login'"
          @click="formType = 'register'"
          >{{ "Register" | _ }}</span
        >
        <span
          class="a-type"
          v-if="formType === 'register'"
          @click="formType = 'login'"
          >{{ "Login" | _ }}</span
        >
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      name: "",
      errorText: "",
      errorTimer: null,
      viewForm: true,
      formType: "login",
    };
  },
  computed: {
    hasError() {
      try {
        return this.errorText.length > 0;
      } catch (e) {
        return false;
      }
    },
    errorTypeOfArray() {
      return typeof this.errorText === "object";
    },
    errorTextView() {
      if (this.errorTypeOfArray) {
        return this.errorText.join(", ");
      }
      return this.errorText;
    },
    headerCss() {
      let css = {};
      if (this.hasError) {
        css.animated = true;
        css.shakeX = true;
      }
      return css;
    },
  },
  methods: {
    /**
     *Soccet connection
     */
    connectToSocket() {
      this.errorText = "";
      if (this.email.length < 1 || this.password.length < 1) {
        this.setError(this.$options.filters._("please fill in the fields"));
      } else if (this.formType === "register" && this.name.length < 1) {
        this.setError(this.$options.filters._("please fill in the fields"));
      } else {
        this.viewForm = false;
        if (!this.$root.socketConnected) {
          this.$root.ws_connection();
        } else {
          this.socketConnectedEvent();
        }
      }
    },
    /**
     * Triggered when connected to socket
     */
    socketConnectedEvent() {
      if (this.formType === "login") {
        this.$root.sendLoginRequest({
          method: "login",
          params: { email: this.email, password: this.password },
          id: "login",
        });
      } else {
        this.$root.sendRegisterRequest({
          method: "register",
          params: {
            email: this.email,
            password: this.password,
            name: this.name,
          },
          id: "register",
        });
      }
    },
    /**
     * Triggered when socket responds to login request
     * @param response
     */
    listenLogin(response) {
      if (Object.prototype.hasOwnProperty.call(response, "error")) {
        this.setError(response.error.message);
      } else {
        if (Object.prototype.hasOwnProperty.call(response, "result")) {
          if (parseInt(response.result.code) === 200) {
            this.$root.setLoginUser(response);
            return;
          }
        } else {
          this.setError(this.$options.filters._("something went wrong"));
        }
      }
      //this.$root.ws_disconnect();
    },
    /**
     * Performs validation for the login form
     * @param message
     */
    setError(message) {
      this.viewForm = true;
      this.errorText = message;
      if (this.errorTimer !== null) {
        clearTimeout(this.errorTimer);
      }
      this.errorTimer = setTimeout(
        function (self) {
          self.errorText = "";
        },
        3000,
        this
      );
    },
  },
  mounted() {
    window.appEvent.on("socket_connected", this.socketConnectedEvent);
    window.appEvent.on("login", this.listenLogin);
  },
  destroyed() {
    window.appEvent.removeListener(
      "socket_connected",
      this.socketConnectedEvent
    );
    window.appEvent.removeListener("login", this.listenLogin);
    console.log("login cleared");
  },
};
</script>

<style lang="scss">
#login-form {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #2980b9;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  .form-inputs {
    width: 300px;
    height: auto;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0px 0px 31px 21.6px rgba(17, 81, 121, 0.5);
    padding: 30px;
    .login-header {
      font-size: 1.3rem;
      text-align: center;
      padding: 0;
      margin: 40px 0 25px 0;
      color: #2980b9;
    }
    .form-group {
      margin-bottom: 30px;
      width: 100%;
      label {
        display: block;
        font-weight: 600;
        padding: 0;
        margin-bottom: 10px;
        font-family: 1rem;
        color: #2980b9;
      }
      .form-control {
        width: 100%;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #2980b9;
      }
    }
    .login-button {
      border: none;
      background: #2980b9;
      width: 100%;
      border-radius: 5px;
      padding: 15px;
      color: #ffffff;
      cursor: pointer;
      transition: all 300ms linear;
      &:hover {
        background: #43e284;
      }
    }
    .error-text {
      color: #e24c56;
    }
  }
  .login-loader {
    text-align: center;
  }
  .login-footer {
    padding: 15px;
    text-align: center;
    .a-type {
      cursor: pointer;
      &:hover {
        color: #2980b9;
      }
    }
  }
}
</style>
