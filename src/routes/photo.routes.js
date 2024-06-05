import { Router } from "express";
import {
  uploadPhoto,
  deletePhoto,
  fetchPhotos,
} from "../controllers/photo.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(upload.single("photo"), userAuth, uploadPhoto);
router.route("/delete").delete(upload.none(), userAuth, deletePhoto);
router.route("/fetch").get(userAuth, fetchPhotos);
export default router;
