import { Router } from "express";
import {
  addSongToPlaylist,
  createPlaylist,
  getUserPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../controller/playlist.controller.js";

const router = Router();

router.post("/", createPlaylist);
router.post("/:id/add-song", addSongToPlaylist);
router.get("/user", getUserPlaylists);
router.put("/:id", updatePlaylist);
router.delete("/:id", removeSongFromPlaylist);

export default router;
