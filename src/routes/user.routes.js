import { Router } from "express";
import { loginUser, 
    logoutUser, 
    registerUser,
     refreshAccessToken, 
     changeCurrentPassword,
     getcurrentUser,
     UpdateUserAvatar,
     updateCoverImage,
     getWatchHistory,
      UpdateAccountDetail, 
      getUserChannelProfile,
     } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/chage-password").post(verifyJWT,changeCurrentPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT,getcurrentUser);
router.route("/update-user").patch(verifyJWT,UpdateAccountDetail);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route('/history').get(verifyJWT, getWatchHistory);
// router.route("/login").post(login);
export default router;