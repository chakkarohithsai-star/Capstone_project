import axios from "axios";

const defaultBaseURL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "https://capstone-project-v867.onrender.com";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
  withCredentials: true,
});
