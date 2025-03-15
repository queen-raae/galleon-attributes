import { createLogger } from "./logger.js";
import { initializeDataBinding } from "./data-binding.js";

// Initialize logger configuration from script attributes or global variable
const currentScript =
  document.currentScript || document.querySelector('script[src*="main.js"]');

const logLevel = (
  window.GL_LOG_LEVEL ||
  currentScript?.getAttribute("data-log-level") ||
  currentScript?.getAttribute("log-level") ||
  "ERROR"
).toUpperCase();

// Configure logger using the createLogger function
const log = createLogger(logLevel);

log.info("Script loaded with log level", logLevel);

// Configure logger and start data binding
function init() {
  // Start the data binding process
  initializeDataBinding(log);
  log.info("Initialized");
}

// Check if document is still loading, otherwise initialize immediately
if (document.readyState === "loading") {
  log.info("Waiting for DOMContentLoaded");
  document.addEventListener("DOMContentLoaded", init);
} else {
  log.info("DOMContentLoaded event already fired");
  init();
}
