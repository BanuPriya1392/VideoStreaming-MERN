const BACKEND_URL = import.meta.env.VITE_API_URL || "https://videostreaming-mern.onrender.com";

export const API_BASE_URL = `${BACKEND_URL}/api`;
export const SERVER_URL = BACKEND_URL;

export default {
  API_BASE_URL,
  SERVER_URL,
};
