// Async handler utility to wrap asynchronous controller functions.
// Eliminates repetitive try/catch blocks in Express routes by catching rejected
// promises and automatically forwarding them to Express's next() error middleware.
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

