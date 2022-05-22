<template>
  <div class="user_list">
    <header>
      <ul>
        <!--
        <li class="active">
          <a>{{ "My friends" | _ }}</a>
        </li>
        -->
        <li @click="changeUserList(-1)"><a> &laquo; </a></li>
        <li>
          <a>{{ userPage }}</a>
        </li>
        <li @click="changeUserList(1)"><a> &raquo; </a></li>
      </ul>
    </header>
    <div class="user-list-wrapper">
      <div class="user-scroll">
        <div v-for="(user, index) in users" :key="'user' + index">
          <div class="user-item" v-if="user._id !== $root.userInfo.id">
            <p>{{ user.name }}</p>
            <a @click="addToFriends(user._id)">{{ "add to friends" | _ }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserList",
  data() {
    return {
      userTab: "myFriends",
      userPage: 1,
      dataItemLimit: 50,
      users: [],
      userListText: "",
    };
  },
  methods: {
    requestGetUsers() {
      let that = this;
      that.$root._send("getUsers", {
        method: "getUsers",
        params: {
          page: that.userPage,
          limit: that.dataItemLimit,
          token: that.$root.userInfo.token,
        },
        id: "getUsers",
      });
    },
    listenUser(res) {
      let that = this;
      if (!Object.prototype.hasOwnProperty.call(res, "error")) {
        that.users = res.result;
      } else {
        that.userListText = that.$options.filters._("no record or not found");
      }
    },
    changeUserList(pagePlus) {
      this.userPage += pagePlus;
      if (this.userPage < 1) {
        this.userPage = 1;
      }
      this.requestGetUsers();
    },
    addToFriends(userId) {
      let that = this;
      that.$root
        ._send("setFriend", {
          method: "setFriend",
          id: "setFriend_" + userId,
          params: {
            token: that.$root.userInfo.token,
            id: userId,
          },
        })
        .then((res) => {
          if (!Object.prototype.hasOwnProperty.call(res, "error")) {
            alert(res.result.message);
          } else {
            alert(res.error.message);
          }
        });
    },
  },
  mounted() {
    this.requestGetUsers();
    window.appEvent.on("getUsers", this.listenUser);
  },
  destroyed() {
    window.appEvent.removeListener("getUsers", this.listenUser);
  },
};
</script>

<style lang="scss">
.user_list {
  background-color: #265285;
  border-radius: 15px;
  width: 100%;
  height: 100%;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  header {
    margin: 0 0 15px 0;
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      border-bottom: 1px solid #1f3864;
      li {
        border-right: 1px solid #1f3864;
        width: 100%;
        color: #ffffff;
        &:first-child {
          border-radius: 15px 0 0 0;
        }
        &:last-child {
          border-right: none;
          border-radius: 0 15px 0 0;
        }
        &:hover,
        &.active {
          background-color: #1f3864;
          cursor: pointer;
        }
        position: relative;
        a {
          display: block;
          padding: 15px;
          width: 100%;
          text-align: center;
        }
      }
    }
  }
  .user-list-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    .user-scroll {
      position: absolute;
      width: 100%;
      height: auto;
      max-height: 100%;
      overflow-y: auto;
      .user-item {
        border-bottom: 1px solid #1f3864;
        padding: 10px;
        color: #ffffff;
        p {
          padding: 0;
          margin: 0;
          font-size: 1.2rem;
          font-weight: bold;
        }
        a {
          font-size: 1rem;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
