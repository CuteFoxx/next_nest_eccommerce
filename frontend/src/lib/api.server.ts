import "server-only";
import axios from "axios";

if (!process.env.BACKEND_URL) {
  throw new Error("BACKEND_URL is not set");
}

export const serverApi = axios.create({
  baseURL: process.env.BACKEND_URL,
});
