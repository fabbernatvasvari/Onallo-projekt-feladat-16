// const express = require("express"); // this does not work because ReferenceError: `require is not defined in ES module scope`, can use import instead
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, username: 'test', email: 'test@example.com', password_hash: '' },
    { id: 2, username: 'anna', email: 'anna@example.com', password_hash: btoa('anna123') },
    { id: 3, username: 'peter', email: 'peter@example.com', password_hash: btoa('peter123') },
    { id: 4, username: 'kata', email: 'kata@example.com', password_hash: btoa('kata123') }
  ]);
});

router.post("/", (req, res) => {
  const newUser = req.body;
  res.json({ message: "User created", user: newUser });
});

export default router;