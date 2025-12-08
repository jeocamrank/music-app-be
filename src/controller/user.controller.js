import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.uid; // FireBase UID
    console.log("Current User ID:", currentUserId);
    const users = await User.find({ fireBaseUid: { $ne: currentUserId } });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.auth.uid;
    const {userId} = req.params;

    const messages = await Message.find({
      $or: [
        {senderId: userId, receiverId: myId},
        {senderId: myId, receiverId: userId}
      ],
    }).sort({ createAt: 1 })

    res.status(200).json(messages)
  } catch (error) {
    next(error);
  }
};
