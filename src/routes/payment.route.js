import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkPaymentStatus, createPaymentUrl } from "../controller/payment.controller.js";


const router = Router();

// 1. Tạo link thanh toán (Cần đăng nhập)
router.post("/create-url", protectRoute, createPaymentUrl);
router.post("/check-status", checkPaymentStatus);

export default router;