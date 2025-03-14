import { createLogger } from "./logger.js";
import { initializeDataBinding } from "./data-binding.js";

document.addEventListener("DOMContentLoaded", function () {
  // Initialize logger configuration from script attributes or global variable
  const currentScript =
    document.currentScript || document.querySelector('script[src*="main.js"]');

  const logLevel = (
    window.GL_LOG_LEVEL ||
    currentScript?.getAttribute("data-log-level") ||
    "ERROR"
  ).toUpperCase();

  // Configure logger using the createLogger function
  const log = createLogger(logLevel);

  // Start the data binding process
  initializeDataBinding(log);
});
