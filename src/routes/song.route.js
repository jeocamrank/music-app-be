import Router from "express";
import {
  downloadSong,
  getAllSongs,
  getFeaturedSongs,
  getMadeForYou,
  getTrendingSongs,
} from "../controller/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/featured", getFeaturedSongs);
router.get("/make-for-you", getMadeForYou);
router.get("/trending", getTrendingSongs);
router.get("/", protectRoute, requireAdmin, getAllSongs);
router.get("/download/:id", protectRoute, downloadSong);

export default router;
