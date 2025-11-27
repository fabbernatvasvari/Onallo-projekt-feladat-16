// const express = require("express"); // this does not work because ReferenceError: `require is not defined in ES module scope`, can use import instead
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Béla" },
    { id: 2, name: "Eszter" }
  ]);
});

router.post("/", (req, res) => {
  const newUser = req.body;
  res.json({ message: "User created", user: newUser });
});

export default router;