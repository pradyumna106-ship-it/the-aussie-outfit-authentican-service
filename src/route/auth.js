import express from "express";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyToken,
  updateUser,
  getUsers
} from "../controller/auth.js";

import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/verify-token", verifyJWT, verifyToken);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logoutUser);

router.post("/logout-all", verifyJWT, logoutAllSessions);

router.get("/:id", verifyJWT, getCurrentUser);

router.put("/:id", verifyJWT, updateUser);

router.get("/", getUsers);

export default router;