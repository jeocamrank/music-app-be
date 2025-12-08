import Router from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getStats } from "../controller/stat.controller.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.middleware.js";

const router = Router();

router.use(verifyFirebaseToken);
router.get("/", protectRoute, requireAdmin, getStats);

export default router;
