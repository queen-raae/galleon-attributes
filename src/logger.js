const levels = {
  NONE: -1,
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

function createLogger(levelKey = "INFO") {
  let currentLevel = levels[levelKey];

  function log(level, method, message, ...args) {
    if (level <= currentLevel) {
      const levelName = Object.keys(levels).find(
        (key) => levels[key] === level
      );
      console[method](`Galleon:`, message, ...args);
    }
  }

  const logger = {
    setLevel: (level) => (currentLevel = levels[level] ?? currentLevel),
    error: (message, ...args) => log(levels.ERROR, "error", message, ...args),
    warn: (message, ...args) => log(levels.WARN, "warn", message, ...args),
    info: (message, ...args) => log(levels.INFO, "info", message, ...args),
    debug: (message, ...args) => log(levels.DEBUG, "debug", message, ...args),
  };

  return logger;
}

export { createLogger, levels };
