export async function fetchData(endpoint, log) {
  log.info(`Starting fetch request for: ${endpoint}`);

  try {
    log.debug(`Initiating fetch for ${endpoint}`);
    const response = await fetch(endpoint);

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
