const axios = require("axios");

const sheetyClient = axios.create({
  baseURL: process.env.SHEETY_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

sheetyClient.interceptors.response.use(
  function (res) {
    return res;
  },
  function (err) {
    var message = "Sheety request failed";
    var status = 503;
    if (err.response && err.response.status) {
      status = err.response.status;
    }
    if (err.message) {
      message = err.message;
    }
    var error = new Error(message);
    error.status = status;
    return Promise.reject(error);
  },
);

module.exports = sheetyClient;
