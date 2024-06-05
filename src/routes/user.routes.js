import { Router } from "express";
import {
  userRegister,
  loginUser,
  userLogout,
  refreshAccessToken,
  changePassword,
  getUser,
  changeUsername,
  updateAvatar,
} from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), userRegister);
router.route("/login").post(upload.none(), loginUser);
router.route("/logout").post(userAuth, userLogout);
router.route("/refresh").get(refreshAccessToken);
router.route("/changePassword").patch(upload.none(), userAuth, changePassword);
router.route("/user").get(userAuth, getUser);
router.route("/username").patch(upload.none(), userAuth, changeUsername);
router.route("/avatar").patch(upload.single("avatar"), userAuth, updateAvatar);

export default router;
