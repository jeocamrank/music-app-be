import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

const uploadToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).select(
      "_id fullName imageUrl fireBaseUid"
    );

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};


export const updateMe = async (req, res, next) => {
  try {
    const fireBaseUid = req.auth.uid;
    const user = await User.findOne({ fireBaseUid });

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const { fullName } = req.body;

    if (fullName) {
      user.fullName = fullName;
    }

    // ✅ Chỉ khi user upload ảnh mới
    if (req.files?.image) {
      // 🔥 Chỉ xóa ảnh cũ nếu là ảnh Cloudinary
      if (user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }

      const image = await uploadToCloudinary(req.files.image);

      user.imageUrl = image.url;
      user.imagePublicId = image.publicId; // 👈 LÚC NÀY mới có
    }

    await user.save();

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user,
    });
  } catch (error) {
    next(error);
  }
};

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
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: myId },
        { senderId: myId, receiverId: userId },
      ],
    }).sort({ createAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
