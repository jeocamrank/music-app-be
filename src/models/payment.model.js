import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true }, // Mã đơn hàng gửi sang MoMo
    requestId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: "MOMO" },
    status: { 
      type: String, 
      enum: ["PENDING", "SUCCESS", "FAILED"], 
      default: "PENDING" 
    },
    transId: { type: String }, // Mã giao dịch phía MoMo trả về
    description: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);