import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    fireBaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date, default: null },
  },
  
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
