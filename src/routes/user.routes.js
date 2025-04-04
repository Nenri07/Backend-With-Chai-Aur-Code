import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js'
const router=Router()
import  {refreshAccessToken,registerUser, loginUser, logoutUser } from '../controller/user.controller.js'
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
export  default router