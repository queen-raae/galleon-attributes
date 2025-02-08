import { getValue } from "./api.js";

export function bindElement(element, data, log) {
  log.debug("Binding element:", { element, data });

  // Bind text content
  const bindText = element.getAttribute("data-gl-bind");
  if (bindText) {
    const value = getValue(data, bindText, log);
    if (value !== undefined) {
      log.debug(`Binding text content: "${bindText}" = "${value}"`);
      element.textContent = value;
    }
  }

  // Bind image src
  const bindSrc = element.getAttribute("data-gl-bind-src");
  if (bindSrc) {
    const value = getValue(data, bindSrc, log);
    if (value !== undefined) {
      log.debug(`Binding src attribute: "${bindSrc}" = "${value}"`);
      element.src = value;
    }
  }

  // Bind href for links
  const bindHref = element.getAttribute("data-gl-bind-href");
  if (bindHref) {
    const value = getValue(data, bindHref, log);
    if (value !== undefined) {
      log.debug(`Binding href attribute: "${bindHref}" = "${value}"`);
      element.href = value;
    }
  }
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

  const bindableElements = element.querySelectorAll(
    "[data-gl-bind], [data-gl-bind-src], [data-gl-bind-href]"
  );

  log.debug(`Found ${bindableElements.length} bindable child elements`);

  bindableElements.forEach((child, index) => {
    log.debug(
      `Processing child element ${index + 1}/${bindableElements.length}`
    );

    const bindPath =
      child.getAttribute("data-gl-bind") ||
      child.getAttribute("data-gl-bind-src") ||
      child.getAttribute("data-gl-bind-href");

    const arrayMatch = bindPath.match(/^(\w+)(\[\d+\])?$/);
    if (arrayMatch) {
      const key = arrayMatch[1];
      const value = getValue(data, key, log);
      const isArray = Array.isArray(value);

      if (isArray) {
        log.debug(
          `Processing array binding for "${key}" with ${value.length} items`
        );
        const template = child.cloneNode(true);
        const arrayData = value;

        arrayData.forEach((item, idx) => {
          log.debug(
            `Creating clone ${idx + 1}/${arrayData.length} for array item`
          );
          const clone = template.cloneNode(true);
          if (typeof item === "object") {
            bindElement(clone, item, log);
          } else {
            log.debug(`Setting text content for array item: "${item}"`);
            clone.textContent = item;
          }
          child.before(clone);
        });

        log.debug("Removing original template element");
        child.remove();
      } else {
        log.debug(`Processing single value binding for "${bindPath}"`);
        bindElement(child, data, log);
      }
    } else {
      log.debug(`Processing nested path binding for "${bindPath}"`);
      bindElement(child, data, log);
    }
  });

  log.debug("Completed data binding for element");
}
