import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true }, // fireBaseUid
    receiverId: { type: String, required: true }, // fireBaseUid
    content: { type: String, required: true },
  },
  { timestamps: true } // created At, updated At
);

export const Message = mongoose.model("Message", messageSchema);
