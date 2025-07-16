/**
 * The following code was refactored using the
 * following Github Copilot prompt and manually editted:
 *
 * Right now the program uses session cookies, refactor to use bearer tokens instead.
 *
 *
 */
import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { imageRouter } from "./routers/image-router.js";
import { commentRouter } from "./routers/comment-router.js";
import { usersRouter } from "./routers/user-router.js";

import dotenv from "dotenv";
dotenv.config();

export const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Move API routes BEFORE static middleware
app.use("/api/images/", imageRouter);
app.use("/api/comments/", commentRouter);
app.use("/api/users/", usersRouter);

// Static middleware for assets (CSS, JS, images) but don't auto-serve index.html
app.use(
  express.static("static", {
    index: false,
  }),
);

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Don't interfere with API routes
  if (req.path.startsWith("/api/")) {
    return next(); // Let other middleware handle API routes
  }

  // For all other routes, serve the main HTML file
  res.sendFile("index.html", { root: "static" });
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
