export async function fetchData(endpoint, options, log) {
  log.info(`Starting fetch request for: ${endpoint}`);

  try {
    log.debug(`Initiating fetch for ${endpoint}`);

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Get auth header if needed
    const authHeader = getAuthHeader(options, log);

    // Skip request if auth is required but no token was found
    if (options.authTokenSource && !authHeader) {
      log.warn(
        `Authentication required but no valid token found. Skipping request to ${endpoint}`
      );
      return null;
    }

    // Add auth header if found
    if (authHeader) {
      headers.set("Authorization", authHeader);
      log.debug("Authorization header set");
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

export function getAuthHeader(options = {}, log) {
  // If no auth source specified, return null
  if (!options.authTokenSource || typeof options.authTokenSource !== "string") {
    log.debug("No auth token source specified");
    return null;
  }

  // Handle default global scope
  let authTokenType = "global";
  let authTokenKey = options.authTokenSource;

  // Handle "source:key"
  const parts = options.authTokenSource.split(":");
  if (parts.length === 2) {
    authTokenType = parts[0];
    authTokenKey = parts[1];
  }

  log.debug(
    `Parsed auth string "${options.authTokenSource}" to type=${authTokenType}, key=${authTokenKey}`
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
        // Handle nested properties like "Outseta.getAccessToken"
        const pathParts = authTokenKey.split(".");
        let globaleKey = window;

        // Navigate through the object path
        for (const part of pathParts) {
          if (globaleKey && typeof globaleKey === "object") {
            globaleKey = globaleKey[part];
          } else {
            globaleKey = undefined;
            break;
          }
        }

        // Check if it's a function
        if (typeof globaleKey === "function") {
          authToken = globaleKey();
          log.debug(
            `Called function from global scope with path: ${authTokenKey}`
          );
        } else {
          authToken = globaleKey;
          log.debug(
            `Retrieved value from global scope with path: ${authTokenKey}`
          );
        }
        break;

      default:
        log.warn(`Unknown auth source type: ${authTokenType}`);
    }

    if (authToken) {
      return `Bearer ${authToken}`;
    } else {
      log.debug(
        "No auth token found, authentication required but not available"
      );
      return null;
    }
  } catch (error) {
    log.error("Error retrieving auth token:", error);
    return null;
  }
}

export function getValue(obj, path, log) {
  log.debug(`Resolving path: "${path}"`, { object: obj });

  try {
    const value = path.split(".").reduce((acc, part) => {
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        log.debug(`Accessing array "${arrayName}" at index ${index}`);
        return acc[arrayName][index];
      }
      log.debug(`Accessing object property "${part}"`);
      return acc[part];
    }, obj);

    log.debug(`Successfully resolved path "${path}"`, { value });
    return value;
  } catch (error) {
    log.error(`Failed to access path "${path}":`, error);
    return undefined;
  }
}
