import {asyncHandler} from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js';
import { User } from '../model/user.modal.js';
import { uploadOnCloudinary } from '../utils/cloduinary.js';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser= asyncHandler(async (req,res) => {
   const {fullName,Password,email}=req.body;
   console.log("email",email);

   if ([fullName,email,Password].some(
    (fields)=>fields?.trim()===""
   )) {
    throw new apiError(400,'all fields have to be filled bro')
    
   }
 const userCheck=  User.findOne({
    $or:[{fullName},{email}]
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
    fullName,
    Password,
    email:email.toLowerCase(),
    avatar,
    coverImage
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