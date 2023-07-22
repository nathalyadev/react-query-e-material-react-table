import axios from "axios";
import { routeConfigs } from "../configs/api";

const api = axios.create({
  baseURL: routeConfigs.URLApi,
});

export { api };