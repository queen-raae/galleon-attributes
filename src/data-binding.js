import { getValue, fetchData } from "./api.js";

// Special bindings that aren't attributes
const SPECIAL_BINDINGS = {
  TEXT: "text",
  HTML: "html",
  VALUE: "value",
};

// Handler functions for special bindings
const SPECIAL_BINDING_HANDLERS = {
  [SPECIAL_BINDINGS.TEXT]: (element, value) => (element.textContent = value),
  [SPECIAL_BINDINGS.HTML]: (element, value) => (element.innerHTML = value),
  [SPECIAL_BINDINGS.VALUE]: (element, value) => (element.value = value),
};

export function bindElement(element, data, log) {
  if (!element || !data) return;

  log.debug("Binding element:", { element, data });

  // Get all attributes that start with 'data-gl-bind' or 'data-gl-bind-*'
  const attributes = Array.from(element.attributes);
  const bindingAttributes = attributes.filter((attr) =>
    attr.name.startsWith("data-gl-bind")
  );

  bindingAttributes.forEach((attr) => {
    const bindPath = attr.value;
    let bindType = attr.name.replace("data-gl-bind-", "");
    if (bindType === "data-gl-bind") {
      bindType = SPECIAL_BINDINGS.TEXT; // Default to text binding
    }

    const value = getValue(data, bindPath, log);
    if (value === undefined) {
      log.debug(`No value found for path: ${bindPath}`);
      return;
    }

    try {
      if (bindType in SPECIAL_BINDING_HANDLERS) {
        log.debug(`Binding: ${bindType} = "${value}"`);
        SPECIAL_BINDING_HANDLERS[bindType](element, value);
      } else {
        log.debug(`Binding attribute: ${bindType} = "${value}"`);
        element.setAttribute(bindType, value);
      }
    } catch (error) {
      log.error(`Error binding ${bindType}:`, error);
    }
  });
}

export function processContainer(container, data, log) {
  log.info("Processing container:", { container, data });

  if (Array.isArray(data)) {
    log.debug(`Processing array data with ${data.length} items`);
    const parent = container.parentElement;
    data.forEach((item, index) => {
      log.debug(`Cloning container for array item ${index}`);
      const clone = container.cloneNode(true);
      clone.removeAttribute("data-gl-get");
      bindData(clone, item, log);
      parent.insertBefore(clone, container);
    });
    container.remove();
    log.debug("Removed original template container");
  } else if (typeof data === "object") {
    log.debug("Processing single object data");
    bindData(container, data, log);
  }
}

export function bindData(element, data, log) {
  log.debug("Starting data binding for element:", { element, data });

  bindElement(element, data, log);

  // Process data-gl-use elements first
  const useElements = Array.from(element.querySelectorAll("[data-gl-use]"));
  useElements.forEach((useElement) => {
    const usePath = useElement.getAttribute("data-gl-use");
    const arrayData = getValue(data, usePath, log);

    if (Array.isArray(arrayData)) {
      log.debug(
        `Processing array data for ${usePath} with ${arrayData.length} items`
      );
      const parent = useElement.parentElement;
      arrayData.forEach((item, index) => {
        log.debug(`Cloning element for array item ${index}`);
        const clone = useElement.cloneNode(true);
        clone.removeAttribute("data-gl-use");
        bindData(clone, item, log);
        parent.insertBefore(clone, useElement);
      });
      useElement.remove();
      log.debug(`Removed original template for ${usePath}`);
    } else if (typeof arrayData === "object" && arrayData !== null) {
      log.debug(`Processing object data for ${usePath}`);
      useElement.removeAttribute("data-gl-use");
      bindData(useElement, arrayData, log);
    } else {
      log.warn(`Invalid data for ${usePath}:`, arrayData);
    }
  });

  // Then process remaining bindable elements
  const bindableElements = Array.from(element.querySelectorAll("*")).filter(
    (el) =>
      Array.from(el.attributes).some((attr) =>
        attr.name.startsWith("data-gl-bind")
      )
  );

  log.debug(`Found ${bindableElements.length} bindable child elements`);

  bindableElements.forEach((child, index) => {
    log.debug(
      `Processing child element ${index + 1}/${bindableElements.length}`
    );

    bindElement(child, data, log);
  });

  log.debug("Completed data binding for element");
}

export async function initializeDataBinding(log) {
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
