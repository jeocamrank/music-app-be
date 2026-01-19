import { Router } from "express";
import { getAllUsers, getMessages, updateMe, getMe, updateUser, deleteUser } from "../controller/user.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get("/me", protectRoute, getMe);
router.patch("/me", protectRoute, updateMe);

// --- Admin Routes ---
router.patch("/:id", protectRoute, requireAdmin, updateUser);
router.delete("/:id", protectRoute, requireAdmin, deleteUser);

export default router
