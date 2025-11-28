import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@fortawesome/fontawesome-free/js/all.min.js";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";
const app = createApp(App);

app.use(router);
app.use(Vue3Toastify, {
	autoClose: 3000,
	position: "top-right",
});
app.mount("#app");
