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

  // Get all attributes that start with 'gl-bind' or 'gl-bind-*'
  const attributes = Array.from(element.attributes);
  const bindingAttributes = attributes.filter((attr) =>
    attr.name.startsWith("gl-bind")
  );

  bindingAttributes.forEach((attr) => {
    const bindPath = attr.value;
    let bindType = attr.name.replace("gl-bind-", "");
    if (bindType === "gl-bind") {
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

function processTemplateElement(element, data, path, log) {
  log.debug(`Processing template element with path: "${path}"`, {
    element,
    data,
  });

  const arrayData = path ? getValue(data, path, log) : data;
  const targetData = Array.isArray(arrayData) ? arrayData : [data];

  if (!targetData || (path && !arrayData)) {
    log.warn(`Invalid data for path: ${path}`, arrayData);
    return;
  }

  const parent = element.parentElement;
  targetData.forEach((item, index) => {
    log.debug(`Cloning element for item ${index}`);
    const clone = element.cloneNode(true);

    // Get the gl-get path if it exists
    const getPath = element.closest("[gl-get]")?.getAttribute("gl-get") || "";
    // Get the iterate path
    const iteratePath = element.getAttribute("gl-iterate") || "";
    // Combine them into a path-like string
    const clonePath = iteratePath ? `${getPath} > ${iteratePath}` : getPath;

    // Remove both attributes to ensure clean clones
    clone.removeAttribute("gl-get");
    clone.removeAttribute("gl-iterate");
    // Add clone identification attributes
    clone.setAttribute("gl-clone", clonePath);
    clone.setAttribute("gl-clone-index", index);
    bindData(clone, item, log);
    parent.insertBefore(clone, element);
  });

  // Hide the template instead of removing it
  element.style.display = "none";
  log.debug("Hidden original template element");
}

export function bindData(element, data, log) {
  log.debug("Starting data binding for element:", { element, data });

  bindElement(element, data, log);

  // Process all template elements (both gl-get and gl-iterate)
  const templateElements = Array.from(
    element.querySelectorAll("[gl-iterate], [gl-get]")
  );
  templateElements.forEach((templateElement) => {
    // If the element has gl-iterate, use that path, otherwise empty path
    const path = templateElement.getAttribute("gl-iterate") || "";
    processTemplateElement(templateElement, data, path, log);
  });

  // Then process remaining bindable elements
  const bindableElements = Array.from(element.querySelectorAll("*")).filter(
    (el) =>
      Array.from(el.attributes).some((attr) => attr.name.startsWith("gl-bind"))
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
  log.info("Initializing data binding");
  const getElements = document.querySelectorAll("[gl-get]");
  log.info(`Found ${getElements.length} elements with gl-get`);

  for (const element of getElements) {
    const endpoint = element.getAttribute("gl-get");
    log.debug(`Processing element with endpoint: ${endpoint}`);

    // Process auth attributes - handle comma-separated values
    const authAttr = element.getAttribute("gl-auth-token");
    const authTokenSources = authAttr
      ? authAttr.split(",").map((src) => src.trim())
      : [];

    const data = await fetchData(endpoint, { authTokenSources }, log);
    if (data) {
      log.debug(`Processing container with data:`, data);
      processTemplateElement(element, data, "", log);
    } else {
      log.warn(`No data received for endpoint: ${endpoint}`);
    }
  }
}
