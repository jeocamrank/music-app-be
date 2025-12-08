import { Song } from "../models/song.model.js";

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
