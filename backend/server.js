// const express = require("express"); // this does not work because ReferenceError: `require is not defined in ES module scope`, can use import instead
import express from "express";
// const cors = require("cors"); // this also does not work with import, because CJS module
import cors from "cors";

import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import registerRoutes from "./routes/register.js";
import loginRoutes from "./routes/login.js";

import startServer from "./endpoints.js"; // import FIRST

const app = express();
app.use(cors());
app.use(express.json());

// mount routes created inside endpoints.js
startServer(app);  

// user routes
// In this project the routes file lives under `src/routes/users.js`.
// Import the file with its actual relative path and extension (ESM requires the exact path).

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.use("/api/messages", messageRoutes);

app.use("/api/messages", (req, res, next) => {
  // Middleware to log request details
  console.log(`${req.method} request to ${req.originalUrl} at ${new Date().toISOString()}`);
  next(); // Proceed to the next middleware or route handler
});
// message routes
// In this project the routes file lives under `src/routes/messages.js`.
// Import the file with its actual relative path and extension (ESM requires the exact path).



app.use("/api/register", (req, res, next) => {
  // Middleware to log request details
  console.log(`${req.method} request to ${req.originalUrl} at ${new Date().toISOString()}`);
  next(); // Proceed to the next middleware or route handler
});
// register routes
// In this project the routes file lives under `src/routes/register.js`.
// Import the file with its actual relative path and extension (ESM requires the exact path).

app.use("/api/register", registerRoutes);



app.use("/api/login", (req, res, next) => {
  // Middleware to log request details
  console.log(`${req.method} request to ${req.originalUrl} at ${new Date().toISOString()}`);
  next(); // Proceed to the next middleware or route handler
});
// login routes
// In this project the routes file lives under `src/routes/login.js`.
// Import the file with its actual relative path and extension (ESM requires the exact path).

app.use("/api/login", loginRoutes);



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
