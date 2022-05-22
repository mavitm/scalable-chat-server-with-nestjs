const appConfig = {
  port: process.env.VUE_APP_PORT || 3001,
  host: process.env.VUE_APP_HOST || "localhost",
  protocol: process.env.VUE_APP_PROTOCOL || "http",
};

export default appConfig;
