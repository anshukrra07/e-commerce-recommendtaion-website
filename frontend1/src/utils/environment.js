/**
 * Environment Configuration Utility for Frontend
 * Determines backend URL based on hostname (localhost, IP, or domain)
 */

export const getBackendURL = () => {
  const hostname = window.location.hostname;

  // Determine if running locally
  const isLocalhost =
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("192.168.") ||
    hostname === "::1" ||
    window.location.protocol === "file:";

  // Return appropriate backend URL
  const BACKEND_URL = isLocalhost
    ? "http://localhost:5050"
    : process.env.REACT_APP_BACKEND_URL || "https://travel-tales-f0hb.onrender.com";

  return BACKEND_URL;
};

export const API_BASE_URL = getBackendURL() + "/api";

export default getBackendURL;
