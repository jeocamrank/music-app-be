import { Router } from "express";
import { getAllUsers, getMessages, updateMe, getMe } from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get("/me", protectRoute, getMe);
router.patch("/me", protectRoute, updateMe);

export default router
