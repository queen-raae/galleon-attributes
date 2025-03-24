export async function fetchData(endpoint, options, log) {
  log.info(`Starting fetch request for: ${endpoint}`);

  try {
    log.debug(`Initiating fetch for ${endpoint}`);

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (options.authTokenSources.length > 0) {
      // At least one auth token source is specified
      const authHeader = getAuthHeader(options, log);

      // Add auth header if found
      if (authHeader) {
        headers.set("Authorization", authHeader);
        log.debug("Authorization header set");
      } else {
        log.warn(
          `Authentication required but no valid token found. Skipping request to ${endpoint}`
        );
        return null;
      }
    }

    const response = await fetch(endpoint, {
      headers,
      ...options.fetchOptions,
    });

    if (!response.ok) {
      log.error(
        `HTTP error fetching ${endpoint}: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const contentType = response.headers.get("content-type");
    log.debug(`Received response with content-type: ${contentType}`);

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      log.info(`Received ${endpoint} data:`, data);
      return data;
    } else {
      log.warn(`Unexpected content-type: ${contentType}`);
      return null;
    }
  } catch (error) {
    log.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export function getAuthHeader({ authTokenSources }, log) {
  // If no auth source specified, return null
  if (authTokenSources.length === 0) {
    log.debug("No auth token source specified");
    return null;
  }

  log.debug(
    `Found ${authTokenSources.length} potential auth sources:`,
    authTokenSources
  );

  // Try each auth source in order, return the first one with a non-empty value
  for (const authTokenSource of authTokenSources) {
    // Handle default global scope
    let authTokenType = "global";
    let authTokenKey = authTokenSource;

    // Handle "source:key"
    const parts = authTokenSource.split(":");
    if (parts.length === 2) {
      authTokenType = parts[0];
      authTokenKey = parts[1];
    }

    log.debug(
      `Trying auth source "${authTokenSource}" (type=${authTokenType}, key=${authTokenKey})`
    );

    let authToken;
    try {
      switch (authTokenType) {
        case "localStorage":
        case "local":
          authToken = localStorage.getItem(authTokenKey || "authToken");
          log.debug(
            `Retrieved auth token from localStorage using key: ${authTokenKey}`
          );
          break;

        case "sessionStorage":
        case "session":
          authToken = sessionStorage.getItem(authTokenKey || "authToken");
          log.debug(
            `Retrieved auth token from sessionStorage using key: ${authTokenKey}`
          );
          break;

        case "query":
        case "url":
          const urlParams = new URLSearchParams(window.location.search);
          authToken = urlParams.get(authTokenKey || "authToken");
          log.debug(
            `Retrieved auth token from URL query parameter using key: ${authTokenKey}`
          );
          break;

        case "global":
          // Check if we have a function call syntax with parentheses
          const functionCallMatch = authTokenKey.match(/^([\w\.]+)\(\)$/);

          if (functionCallMatch) {
            // It's a function call syntax with parentheses
            const funcPath = functionCallMatch[1];
            log.debug(`Detected function call syntax: ${funcPath}()`);

            // Get the function from the global scope
            const globalFunc = getGlobalValue(funcPath, log);

            // Call the function if it exists
            if (typeof globalFunc === "function") {
              authToken = globalFunc();
              log.debug(
                `Called function from global scope with path: ${funcPath}()`
              );
            } else {
              log.warn(`Function not found or not callable: ${funcPath}`);
            }
          } else {
            // Handle nested properties like "Outseta.getAccessToken" (no parentheses)
            // or simple global variables
            const globalValue = getGlobalValue(authTokenKey, log);

            // Check if it's a function (legacy behavior without parentheses)
            if (typeof globalValue === "function") {
              authToken = globalValue();
              log.debug(
                `Called function from global scope with path: ${authTokenKey} (legacy syntax without parentheses)`
              );
            } else {
              authToken = globalValue;
              log.debug(
                `Retrieved value from global scope with path: ${authTokenKey}`
              );
            }
          }
          break;

        default:
          log.warn(`Unknown auth source type: ${authTokenType}`);
      }

      // Only consider truthy values as valid
      if (Boolean(authToken)) {
        log.debug(`Found valid value from source: ${authTokenSource}`);
        return `Bearer ${authToken}`;
      } else {
        log.debug(
          `Falsy value found from source: ${authTokenSource}, trying next source`
        );
      }
    } catch (error) {
      log.error(`Error retrieving auth token from ${authTokenSource}:`, error);
      // Continue to the next source on error
    }
  }

  log.debug("No valid value found from any source");
  return null;
}

/**
 * Retrieves a value from the global scope using a dot notation path
 * @param {string} path - The dot notation path to the value
 * @param {object} log - Logger instance
 * @returns {any} The value at the specified path or undefined if not found
 */
export function getGlobalValue(path, log) {
  if (!path) {
    log.debug(`Invalid path: ${path}`);
    return undefined;
  }

  log.debug(`Retrieving global value for path: ${path}`);

  try {
    // Use reduce to navigate through the object path
    const value = path.split(".").reduce((acc, part) => {
      if (!acc || typeof acc !== "object") {
        return undefined;
      }

      if (!(part in acc)) {
        log.debug(`Property "${part}" not found in global scope`);
        return undefined;
      }

      return acc[part];
    }, window);

    log.debug(`Retrieved global value for path: ${path}`, value);
    return value;
  } catch (error) {
    log.error(`Error retrieving global value for path: ${path}:`, error);
    return undefined;
  }
}

export function getValue(obj, path, log) {
  if (!obj || !path) {
    log.debug(`Invalid object or path: ${path}`);
    return undefined;
  }

  log.debug(`Resolving path: "${path}"`, { object: obj });

  try {
    // Use reduce to navigate through the object path
    const value = path.split(".").reduce((acc, part) => {
      if (acc === undefined || acc === null) {
        return undefined;
      }

      // Handle array indexing
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        log.debug(`Accessing array "${arrayName}" at index ${index}`);

        if (!acc[arrayName] || !Array.isArray(acc[arrayName])) {
          log.debug(`Array "${arrayName}" not found or not an array`);
          return undefined;
        }

        return acc[arrayName][index];
      }

      log.debug(`Accessing object property "${part}"`);
      if (!(part in acc)) {
        log.debug(`Property "${part}" not found`);
        return undefined;
      }

      return acc[part];
    }, obj);

    log.debug(`Successfully resolved path "${path}"`, { value });
    return value;
  } catch (error) {
    log.error(`Failed to access path "${path}":`, error);
    return undefined;
  }
}
