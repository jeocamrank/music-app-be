import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";

export const getAllSongs = async (req, res, next) => {
  try {
    // -1 = descending order => newest first
    const songs = await Song.find();
    res.status(200).json({ songs }).sort({ createdAt: -1 });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedSongs = async (req, res, next) => {
  try {
    // fetch 6 random songs using mongoose aggregate
    const songs = await Song.aggregate([
      {
        $sample: { size: 6 },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          imageUrl: 1,
          audioUrl: 1,
        },
      },
    ]);
    res.json({ songs });
  } catch (error) {
    next(error);
  }
};

export const getMadeForYou = async (req, res, next) => {
  try {
    // fetch 4 random songs using mongoose aggregate
    const songs = await Song.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          imageUrl: 1,
          audioUrl: 1,
        },
      },
    ]);
    res.json({ songs });
  } catch (error) {
    next(error);
  }
};

export const getTrendingSongs = async (req, res, next) => {
  try {
    // fetch 4 random songs using mongoose aggregate
    const songs = await Song.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          imageUrl: 1,
          audioUrl: 1,
        },
      },
    ]);
    res.json({ songs });
  } catch (error) {
    next(error);
  }
};

export const downloadSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    let fireBaseUid = req.auth?.uid;

    if (!fireBaseUid) {
      fireBaseUid = req.query.uid; // Backup nếu middleware không bắt được
    }

    // 1. Kiểm tra User và quyền Premium
    const user = await User.findOne({ fireBaseUid });
    if (!user || !user.isPremium) {
      return res.status(403).json({ 
        message: "Tính năng tải nhạc chỉ dành cho thành viên Premium." 
      });
    }

    // 2. Tìm bài hát trong DB
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ message: "Không tìm thấy bài hát." });
    }

    // 3. Lấy file từ Cloudinary dưới dạng Stream
    const response = await axios({
      method: "get",
      url: song.audioUrl,
      responseType: "stream",
    });

    // 4. Thiết lập Header để trình duyệt hiểu đây là file tải về (Attachment)
    // Tên file: "Artist - Title.mp3"
    const fileName = `${song.artist} - ${song.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '-'); // Clear ký tự đặc biệt
    
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader("Content-Type", "audio/mpeg");

    // 5. Pipe dữ liệu từ Cloudinary thẳng về phía Client
    response.data.pipe(res);

  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: "Lỗi trong quá trình tải nhạc." });
  }
};