import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
const router=Router()
import  {refreshAccessToken,registerUser, loginUser, logoutUser, changeCurrentpassword, currentUser, updateAccountDetails, updateavatar, updatCoverImage, channelDetails, getwatchHistory } from '../controller/user.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route('/register').post(
    upload.fields([
        {
            "name":"avatar",
            maxCount:1
        },
        {
           "name":"coverImage",
            maxCount:1 
        }

    ]),
    registerUser)

router.route("/login").post(loginUser)

//secure routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/reset-password").post(verifyJWT,changeCurrentpassword)
router.route("/get-user").get(verifyJWT,currentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateavatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updatCoverImage)
router.route("/c/:username").get(verifyJWT,channelDetails)
router.route("/history").get(verifyJWT,getwatchHistory)








export  default router