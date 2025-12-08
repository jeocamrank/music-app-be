import { User } from "../models/user.model.js";

export const authCallback = async (req, res) => {
  try {
    const { id, fullName, imageUrl } = req.body;

    const user = await User.findOne({ fireBaseUid: id });

    if (!user) {
      await User.create({
        fireBaseUid: id,
        fullName,
        imageUrl,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in auth callback", error);
    next(error);
  }
};
