// const express = require("express"); // this does not work because ReferenceError: `require is not defined in ES module scope`, can use import instead
import express from "express";

// const cors = require("cors"); // this also does not work with import, because CJS module
import cors from "cors";
import startServer from "./endpoints.js"; // import FIRST

const app = express();
app.use(cors());
app.use(express.json());

// mount routes created inside endpoints.js
startServer(app);  

// user routes
// In this project the routes file lives under `src/routes/users.js`.
// Import the file with its actual relative path and extension (ESM requires the exact path).
import userRoutes from "./routes/users.js";

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
