import { User } from "../model/user.modal.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

 export const verifyJWT= asyncHandler(async (req,res,next)=>{
    try {
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
        
        if(!token){
            throw new apiError(401,"unauthorize Request")    
        }
    
       const verifiedTokken=  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
       
      const user= await User.findById(verifiedTokken?._id).select(
        "-refreshToken -password"
       )
       if(!user){
        throw new apiError(401,"no refresh toke n found")
       }
       req.user= user;
       next()
    
    } catch (error) {
        throw new apiError(400,"internal Error")
    }
 })