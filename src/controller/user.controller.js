import {asyncHandler} from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js';
import { User } from '../model/user.modal.js';
import { uploadOnCloudinary } from '../utils/cloduinary.js';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser= asyncHandler(async (req,res) => {
   const {fullname,password,email,username}=req.body;
   console.log("email",email);

   if ([fullname,email,password].some(
    (fields)=>fields?.trim()===""
   )) {
    throw new apiError(400,'all fields have to be filled bro')
    
   }
 const userCheck= await User.findOne({
    $or:[{fullname},{email}]
   })
   if (userCheck) {
     throw new apiError(409,'User with email or password exits already')
   }

   const localPathavatar= req.files?.avatar[0]?.path;
   const localPathCoverImage= req.files?.coverImage[0]?.path;
   if(!localPathCoverImage|| !localPathavatar){
    throw new apiError(400,'upload both images cover and avatar. Required*')
   }

   const avatar= await uploadOnCloudinary(localPathavatar)
   
   const coverImage= await uploadOnCloudinary(localPathCoverImage)

   if(!avatar || !coverImage){
    throw new apiError(400,'upload images failed')

   }

 const user= await  User.create({
    fullname,
    password,
    username,
    email:email.toLowerCase(),
    avatar:avatar.url,
    coverImage: coverImage.url
   })

   const createdUser= await User.findById(user._id).select(
    "-refreshToken -Password"
   )

   if (!createdUser) {
        throw new apiError(500,'Something went wrong while creating account')
   }

   return res.status(201).json(
    new apiResponse(
        200,
        createdUser,
        "succesfuly created the account les go"
    )
   )
})
export default registerUser