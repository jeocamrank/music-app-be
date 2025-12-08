import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Song } from "../models/song.model.js";

const getUserIdFromUid = async (fireBaseUid) => {
  const user = await User.findOne({ fireBaseUid });
  if (!user) throw new Error("User not found");
  return user._id;
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, imageUrl } = req.body;
    const fireBaseUid = req.auth.uid;
    const userId = await getUserIdFromUid(fireBaseUid);
    const newPlaylist = new Playlist({
      title,
      description,
      imageUrl,
      userId,
      songs: [],
    });
    await newPlaylist.save();
    res.status(201).json({ playlist: newPlaylist });
  } catch (error) {
    next(error);
  }
};

export const getUserPlaylists = async (req, res, next) => {
  try {
    let fireBaseUid = req.auth?.uid; // Nếu không có Firebase token vẫn không crash

    // 🔥 hỗ trợ test Postman không cần token
    if (!fireBaseUid) {
      fireBaseUid = req.body.uid || req.query.uid;
    }
    if (!fireBaseUid) {
      return res.status(400).json({ error: "UID not provided!" });
    }
    console.log("UID nhận được:", fireBaseUid);
    const userId = await getUserIdFromUid(fireBaseUid);
    const playlists = await Playlist.find({ userId })
      .populate("songs", "title artist imageUrl audioUrl duration")
      .sort({ createdAt: -1 });

    res.status(200).json({ playlists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // check ownership
    const fireBaseUid = req.auth.uid;
    const userId = await getUserIdFromUid(fireBaseUid);
    if (playlist.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this playlist" });
    }

    // check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    const updatedPlaylist = await Playlist.findById(id).populate(
      "songs",
      "title artist imageUrl audioUrl duration"
    );
    res.status(200).json({ playlist: updatedPlaylist });
  } catch (error) {
    next(error);
  }
};

export const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    const fireBaseUid = req.auth.uid;
    const userId = await getUserIdFromUid(fireBaseUid);
    if (playlist.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this playlist" });
    }

    playlist.songs = playlist.songs.filter((sId) => sId.toString() !== songId);
    await playlist.save();

    const updatedPlaylist = await Playlist.findById(id).populate(
      "songs",
      "title artist imageUrl audioUrl duration"
    );
    res.status(200).json({ playlist: updatedPlaylist });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl } = req.body;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check ownership
    const fireBaseUid = req.auth.uid;
    const userId = await getUserIdFromUid(fireBaseUid);
    if (playlist.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this playlist" });
    }

    if (title) playlist.title = title;
    if (description) playlist.description = description;
    if (imageUrl) playlist.imageUrl = imageUrl;

    await playlist.save();
    res.status(200).json({ playlist });
  } catch (error) {
    next(error);
  }
};
