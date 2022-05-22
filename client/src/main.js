import Vue from "vue";
import App from "./App.vue";
import { AllFilters } from "./filters/AllFilters";
import { appWebSocket } from "@/mixins/AppWebSocket";
import { AppData } from "@/mixins/AppData";
const EventEmitter = require("events");

Object.entries(AllFilters).forEach(function ([name, method]) {
  Vue.filter(name, method);
});
Vue.config.productionTip = false;
window.appEvent = new EventEmitter();
window.App = new Vue({
  mixins: [AppData, appWebSocket],
  render: (h) => h(App),
}).$mount("#app");
