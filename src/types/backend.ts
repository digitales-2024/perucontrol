import createClient from "openapi-fetch";
import type { paths } from "./api";

// FIXME: replace with env var URL
/**
 * Client for connecting with the backend
 */
export const backend = createClient<paths>({ baseUrl: "http://localhost:5233" });
