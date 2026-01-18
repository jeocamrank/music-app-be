import crypto from "crypto";
import axios from "axios";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";

// Config chung lấy từ env
const getConfig = () => ({
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT,
  queryEndpoint: process.env.MOMO_QUERY_ENDPOINT,
  redirectUrl: process.env.MOMO_REDIRECT_URL,
  ipnUrl: process.env.MOMO_IPN_URL,
});

// --- API 1: TẠO THANH TOÁN ---
export const createPaymentUrl = async (req, res, next) => {
  try {
    const config = getConfig();
    const { amount = "50000" } = req.body;
    const userId = req.auth.userId; // Lấy từ middleware

    const orderInfo = "Thanh toan Premium MusicApp";
    const requestType = "captureWallet";
    const requestId = config.partnerCode + new Date().getTime();
    const orderId = requestId; 
    const extraData = "";

    // Tạo chữ ký (Signature) cho Create Request
    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto.createHmac("sha256", config.secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode: config.partnerCode,
      accessKey: config.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: config.redirectUrl,
      ipnUrl: config.ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: "vi",
    };

    // Lưu DB trạng thái PENDING
    await Payment.create({
      userId,
      orderId,
      requestId,
      amount: Number(amount),
      status: "PENDING",
      paymentMethod: "MOMO"
    });

    // Gọi MoMo lấy payUrl
    const response = await axios.post(config.endpoint, requestBody);

    if (response.data && response.data.payUrl) {
      return res.status(200).json({ 
        payUrl: response.data.payUrl, 
        orderId: orderId 
      });
    } else {
      console.error("MoMo Create Error:", response.data);
      return res.status(400).json({ message: "Lỗi tạo thanh toán", detail: response.data });
    }
  } catch (error) {
    next(error);
  }
};

// --- API 2: KIỂM TRA TRẠNG THÁI (POLLING) ---
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const config = getConfig();

    // 1. Check DB trước (để đỡ spam MoMo nếu đã thành công rồi)
    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Order not found" });

    if (payment.status === "SUCCESS") {
      return res.status(200).json({ status: "SUCCESS", message: "Đã thanh toán" });
    }

    // 2. Nếu chưa, hỏi MoMo (Query Transaction)
    const requestId = orderId; 
    const rawSignature = `accessKey=${config.accessKey}&orderId=${orderId}&partnerCode=${config.partnerCode}&requestId=${requestId}`;
    const signature = crypto.createHmac("sha256", config.secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode: config.partnerCode,
      accessKey: config.accessKey,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: "vi",
    };

    const response = await axios.post(config.queryEndpoint, requestBody);
    
    // resultCode = 0: Giao dịch thành công
    if (response.data && response.data.resultCode == 0) {
        
        // CẬP NHẬT DB
        payment.status = "SUCCESS";
        await payment.save();

        // KÍCH HOẠT PREMIUM
        const user = await User.findById(payment.userId);
        if (user) {
            user.isPremium = true;
            // Cộng 30 ngày
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            user.premiumExpiry = expiry;
            await user.save();
        }

        return res.status(200).json({ status: "SUCCESS" });
    }

    // Các trường hợp còn lại (đang chờ thanh toán)
    return res.status(200).json({ status: "PENDING" });

  } catch (error) {
    console.error("Check Status Error:", error.message);
    return res.status(500).json({ message: "Internal Error" });
  }
};