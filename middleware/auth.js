/**
 * The following code was refactored using the
 * following Github Copilot prompt and manually editted:
 *
 * Right now the program uses session cookies, refactor to use bearer tokens instead.
 *
 *
 */
export const isAuthenticated = function (req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not Authenticated" });
  }
  next();
};
