import { getValue } from "./api.js";

export function bindElement(element, data, log) {
  // Bind text content
  const bindText = element.getAttribute("data-gl-bind");
  if (bindText) {
    const value = getValue(data, bindText, log);
    if (value !== undefined) {
      element.textContent = value;
    }
  }

  // Bind image src
  const bindSrc = element.getAttribute("data-gl-bind-src");
  if (bindSrc) {
    const value = getValue(data, bindSrc, log);
    if (value !== undefined) {
      element.src = value;
    }
  }

  // Bind href for links
  const bindHref = element.getAttribute("data-gl-bind-href");
  if (bindHref) {
    const value = getValue(data, bindHref, log);
    if (value !== undefined) {
      element.href = value;
    }
  }
}

export function processContainer(container, data, log) {
  if (Array.isArray(data)) {
    const parent = container.parentElement;
    data.forEach((item) => {
      const clone = container.cloneNode(true);
      clone.removeAttribute("data-gl-get");
      bindData(clone, item, log);
      parent.insertBefore(clone, container);
    });
    container.remove();
  } else if (typeof data === "object") {
    bindData(container, data, log);
  }
}

export function bindData(element, data, log) {
  bindElement(element, data, log);

  const bindableElements = element.querySelectorAll(
    "[data-gl-bind], [data-gl-bind-src], [data-gl-bind-href]"
  );
  bindableElements.forEach((child) => {
    const bindPath =
      child.getAttribute("data-gl-bind") ||
      child.getAttribute("data-gl-bind-src") ||
      child.getAttribute("data-gl-bind-href");

    const arrayMatch = bindPath.match(/^(\w+)(\[\d+\])?$/);
    if (arrayMatch) {
      const key = arrayMatch[1];
      const isArray = Array.isArray(getValue(data, key, log));
      if (isArray) {
        const template = child.cloneNode(true);
        const arrayData = getValue(data, key, log);

        arrayData.forEach((item) => {
          const clone = template.cloneNode(true);
          if (typeof item === "object") {
            bindElement(clone, item, log);
          } else {
            clone.textContent = item;
          }
          child.before(clone);
        });

        child.remove();
      } else {
        bindElement(child, data, log);
      }
    } else {
      bindElement(child, data, log);
    }
  });
}
