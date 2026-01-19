import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import {
  checkPaymentStatus,
  createPaymentUrl,
  getAllPayments,
} from "../controller/payment.controller.js";

const router = Router();

// 1. Tạo link thanh toán (Cần đăng nhập)
router.post("/create-url", protectRoute, createPaymentUrl);
router.post("/check-status", checkPaymentStatus);
router.get("/all", protectRoute, requireAdmin, getAllPayments);

export default router;
