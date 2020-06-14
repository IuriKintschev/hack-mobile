import axios from "axios";

const api = axios.create({
  baseURL: "http://enterprise.escalepro.com.br/wp-json",
});

export default api;
