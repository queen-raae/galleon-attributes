import { createLogger, levels } from "./logger.js";
import { fetchData } from "./api.js";
import { processContainer } from "./data-binding.js";

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

  // Replace console.log/error calls with Logger
  async function initializeDataBinding() {
    const getElements = document.querySelectorAll("[data-gl-get]");
    log.info(`Found ${getElements.length} elements with data-gl-get`);

    for (const element of getElements) {
      const endpoint = element.getAttribute("data-gl-get");
      log.debug(`Processing element with endpoint: ${endpoint}`);

      const data = await fetchData(endpoint, log);
      if (data) {
        log.debug(`Processing container with data:`, data);
        processContainer(element, data, log);
      } else {
        log.warn(`No data received for endpoint: ${endpoint}`);
      }
    }
  }

  // Start the data binding process
  initializeDataBinding();
});
