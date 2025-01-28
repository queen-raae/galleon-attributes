document.addEventListener("DOMContentLoaded", function () {
  /**
   * Fetch data from a specified endpoint.
   * @param {string} endpoint - The API endpoint to fetch data from.
   * @returns {Promise<any>} - The fetched data.
   */
  async function fetchData(endpoint) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`Error fetching ${endpoint}: ${response.statusText}`);
        return null;
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  /**
   * Retrieve a value from an object based on a path string (supports dot notation and array indices).
   * @param {object} obj - The object to retrieve the value from.
   * @param {string} path - The path string (e.g., "image.url" or "tags[1]").
   * @returns {any} - The retrieved value.
   */
  function getValue(obj, path) {
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
      console.log("getValue", path, value);
      return value;
    } catch (error) {
      console.error(`Error accessing path "${path}":`, error);
      return undefined;
    }
  }

  /**
   * Bind data to a single element based on its data-gl-bind attributes.
   * @param {HTMLElement} element - The element to bind data to.
   * @param {object} data - The data object to bind.
   */
  function bindElement(element, data) {
    // Bind text content
    const bindText = element.getAttribute("data-gl-bind");
    if (bindText) {
      const value = getValue(data, bindText);
      if (value !== undefined) {
        element.textContent = value;
      }
    }

    // Bind image src
    const bindSrc = element.getAttribute("data-gl-bind-src");
    if (bindSrc) {
      const value = getValue(data, bindSrc);
      if (value !== undefined) {
        element.src = value;
      }
    }

    // Bind href for links
    const bindHref = element.getAttribute("data-gl-bind-href");
    if (bindHref) {
      const value = getValue(data, bindHref);
      if (value !== undefined) {
        element.href = value;
      }
    }
  }

  /**
   * Process and bind data for a given container element.
   * @param {HTMLElement} container - The container element with data-gl-get.
   * @param {any} data - The data fetched from the endpoint.
   */
  function processContainer(container, data) {
    if (Array.isArray(data)) {
      const parent = container.parentElement;
      data.forEach((item) => {
        const clone = container.cloneNode(true);
        clone.removeAttribute("data-gl-get");
        bindData(clone, item);
        parent.insertBefore(clone, container);
      });
      container.remove(); // Remove the original template container
    } else if (typeof data === "object") {
      bindData(container, data);
    }
  }

  /**
   * Bind data recursively to an element and its children.
   * @param {HTMLElement} element - The element to bind data to.
   * @param {object} data - The data object.
   */
  function bindData(element, data) {
    // Bind the current element
    bindElement(element, data);

    // Handle nested bindings (e.g., tags, links, socials)
    const bindableElements = element.querySelectorAll(
      "[data-gl-bind], [data-gl-bind-src], [data-gl-bind-href]"
    );
    bindableElements.forEach((child) => {
      const bindPath =
        child.getAttribute("data-gl-bind") ||
        child.getAttribute("data-gl-bind-src") ||
        child.getAttribute("data-gl-bind-href");

      // Check if the bindPath refers to an array
      const arrayMatch = bindPath.match(/^(\w+)(\[\d+\])?$/);
      if (arrayMatch) {
        const key = arrayMatch[1];
        const isArray = Array.isArray(getValue(data, key));
        if (isArray) {
          // Handle array binding by cloning the element for each array item
          const template = child.cloneNode(true);
          const arrayData = getValue(data, key);

          // Insert clones before the template
          arrayData.forEach((item) => {
            const clone = template.cloneNode(true);
            if (typeof item === "object") {
              bindElement(clone, item);
            } else {
              clone.textContent = item;
            }
            // Insert before the template element
            child.before(clone);
          });

          // Remove the template element
          child.remove();
        } else {
          // Single binding
          bindElement(child, data);
        }
      } else {
        // Complex paths like "links.label"
        bindElement(child, data);
      }
    });
  }

  /**
   * Initialize the data binding process by finding all data-gl-get elements.
   */
  async function initializeDataBinding() {
    const getElements = document.querySelectorAll("[data-gl-get]");
    for (const element of getElements) {
      const endpoint = element.getAttribute("data-gl-get");
      const data = await fetchData(endpoint);
      console.log(`Fetched data from ${endpoint}:`, data);
      if (data) {
        processContainer(element, data);
      }
    }
  }

  // Start the data binding process
  initializeDataBinding();
});
