export const AppData = {
  data() {
    return {
      isLogin: false,
      userInfo: {},
      messageList: [],
      userList: [],
    };
  },
  methods: {
    setLoginUser(wsResponse) {
      this.userInfo.name = wsResponse.result.name;
      this.userInfo.id = wsResponse.result._id;
      this.userInfo.token = wsResponse.result.token;

      this.isLogin = true;
    },
  },
  mounted() {},
};
