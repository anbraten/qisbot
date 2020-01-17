module.exports = (level, ...args) => {
  if (process.env.LOG === level || level === 'info') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
