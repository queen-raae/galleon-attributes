export async function fetchData(endpoint, log) {
  try {
    log.debug(`Fetching data from ${endpoint}`);
    const response = await fetch(endpoint);
    if (!response.ok) {
      log.error(`Error fetching ${endpoint}: ${response.statusText}`);
      return null;
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      log.debug(`Successfully fetched data from ${endpoint}`, data);
      return data;
    }
  } catch (error) {
    log.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export function getValue(obj, path, log) {
  try {
    const value = path.split(".").reduce((acc, part) => {
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        return acc[arrayName][index];
      }
      return acc[part];
    }, obj);
    log.debug("getValue", { path, value });
    return value;
  } catch (error) {
    log.error(`Error accessing path "${path}":`, error);
    return undefined;
  }
}
