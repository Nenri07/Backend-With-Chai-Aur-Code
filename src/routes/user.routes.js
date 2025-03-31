import { Router } from "express";

const router=Router()


import registerUser from '../controller/user.controller.js'

router.route('/register').post(registerUser)

export  default router