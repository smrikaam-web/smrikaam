// Suppress non-actionable Node.js internal library deprecation warnings (e.g. url.parse DEP0169)
if (typeof process !== 'undefined') {
  if (process.emitWarning) {
    const originalEmitWarning = process.emitWarning;
    process.emitWarning = function (warning, ...args) {
      if (typeof warning === 'string' && (warning.includes('url.parse') || warning.includes('DEP0169'))) return;
      if (warning && (warning.code === 'DEP0169' || warning.name === 'DeprecationWarning' || (warning.message && warning.message.includes('url.parse')))) return;
      return originalEmitWarning.call(process, warning, ...args);
    };
  }
  if (process.removeAllListeners) {
    process.removeAllListeners('warning');
  }
  if (process.on) {
    process.on('warning', (warning) => {
      if (warning && (warning.code === 'DEP0169' || (warning.message && warning.message.includes('url.parse')))) return;
      console.warn(warning);
    });
  }
}
