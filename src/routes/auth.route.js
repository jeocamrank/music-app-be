import Router from "express";
import { authCallback } from "../controller/auth.controller.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.middleware.js";
const router = Router();

router.use(verifyFirebaseToken);
router.post("/callback", authCallback);

export default router;
