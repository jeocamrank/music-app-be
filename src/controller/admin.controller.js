import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res
        .status(400)
        .json({ message: "Audio and image files are required" });
    }
    const { title, artist, duration, albumId } = req.body;
    if (!title || !artist || !duration) {
      return res
        .status(400)
        .json({ message: "Title, artist, and duration are required" });
    }

    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;
    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    const song = new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      duration,
      albumId: albumId || null,
    });

    await song.save();

    if (albumId) {
      await Album.findByIdAndUpdate(albumId, { $push: { songs: song._id } });
    }

    res.status(201).json({ message: "Song created successfully", song });
  } catch (error) {
    console.error("Error creating song:", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id);

    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
    }

    await Song.findByIdAndDelete(id);
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Error deleting song:", error);
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, releaseYear } = req.body;
    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const album = new Album({
      title,
      artist,
      imageUrl,
      releaseYear,
    });

    await album.save();

    res.status(201).json({ message: "Album created successfully", album });
  } catch (error) {
    console.error("Error creating album:", error);
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Song.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Album and associated songs deleted successfully" });
  } catch (error) {
    console.error("Error deleting album:", error);
    next(error);
  }
};

export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};

export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, releaseYear } = req.body;
    const imageFile = req.files?.imageFile; // Optional

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (title) album.title = title;
    if (artist) album.artist = artist;
    if (releaseYear) album.releaseYear = releaseYear;

    if (imageFile) {
      const imageUrl = await uploadToCloudinary(imageFile);
      album.imageUrl = imageUrl;
    }

    await album.save();

    res.status(200).json({ message: "Album updated successfully", album });
  } catch (error) {
    console.error("Error updating album:", error);
    next(error);
  }
};

export const updateSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, duration, albumId } = req.body;
    const audioFile = req.files?.audioFile; // Optional
    const imageFile = req.files?.imageFile; // Optional

    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // 1. Xử lý logic thay đổi Album (Quan trọng)
    // Nếu có albumId mới và nó khác albumId hiện tại
    if (albumId && song.albumId && albumId !== song.albumId.toString()) {
      // Xóa song ID khỏi album cũ
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
      // Thêm song ID vào album mới
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
      song.albumId = albumId;
    } 
    // Trường hợp bài hát trước đó chưa có album, giờ mới thêm vào
    else if (albumId && !song.albumId) {
       await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
      song.albumId = albumId;
    }
    // Trường hợp muốn gỡ bài hát khỏi album (albumId gửi lên là null hoặc rỗng)
    else if (song.albumId && (albumId === "" || albumId === null)) {
       await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
      song.albumId = null; // Hoặc undefined tùy schema
    }

    // 2. Cập nhật thông tin cơ bản
    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (duration) song.duration = duration;

    // 3. Cập nhật file nếu có upload mới
    if (audioFile) {
      const audioUrl = await uploadToCloudinary(audioFile);
      song.audioUrl = audioUrl;
    }

    if (imageFile) {
      const imageUrl = await uploadToCloudinary(imageFile);
      song.imageUrl = imageUrl;
    }

    await song.save();

    res.status(200).json({ message: "Song updated successfully", song });
  } catch (error) {
    console.error("Error updating song:", error);
    next(error);
  }
};