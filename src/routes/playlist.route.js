import { Router } from "express";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
  removeSongFromPlaylist,
  getPlaylistById,
  updatePlaylist,
} from "../controller/playlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protectRoute);

router.post("/", createPlaylist);
router.post("/:id/add-song", addSongToPlaylist);
router.get("/", getUserPlaylists);
router.get("/:id", getPlaylistById);
router.put("/:id", updatePlaylist);
router.delete("/:id/delete-song", removeSongFromPlaylist);
router.delete("/:id", deletePlaylist);

export default router;
