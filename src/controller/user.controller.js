import {asyncHandler} from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js';
import { User } from '../model/user.modal.js';
import { uploadOnCloudinary } from '../utils/cloduinary.js';
import { apiResponse } from '../utils/apiResponse.js';

//method to generate access and refresh token
const genrateAccessandRefreshtoken= async(userid)=>{
 try {
  const user= User.findById(userid)
  const accessToken= user.AccessTokengenerate()
  const refreshToken=user.RefreshTokengenerate()

  user.refreshToken=refreshToken
 await  user.save({validateBeforeSave:false})
 return{accessToken,refreshToken}

 } catch (error) {
  throw new apiError(500,'oops Server side error sorry')
  
 }
}


//loginUser function
const loginUser=asyncHandler(async (req,res)=>{
  const {fullname,email,username,password}=req.body
  if (!email||!username) {
    throw new apiError(409,'must required username or email')
  }

 const user =await User.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new apiError(500,'user not found')
  }
  const ispasswordValid= await user.isPasswordcorrect(password)
  if(!ispasswordValid){
    throw new apiError(400,'invalid user credidential')
  }
  
  //generating the tokens for session and cookies through method we created and sending _id
   //which mongoose auto generate in mongo db 
   const {accessToken,refreshToken} =await genrateAccessandRefreshtoken(user._id)
   const loggedinUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )
   const options={
    httpOnly:true,
    secure:true
   }

   return res
    .status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
      new apiResponse(
        200,
        {
          user:loggedinUser,refreshToken,accessToken
        },
        "user loggedIn successfully"

    )
   )

})

//register user function
const registerUser= asyncHandler(async (req,res) => {
   const {fullname,password,email,username}=req.body;

   if ([fullname,email,password].some(
    (fields)=>fields?.trim()===""
   )) {
    throw new apiError(400,'all fields have to be filled bro')
    
   }
   //logic to check exiting user by using mongoose buillt in findOne function
 const userCheck= await User.findOne({
    $or:[{fullname},{email}]
   })
   if (userCheck) {
     throw new apiError(409,'User with email or password exits already')
   }
   //logic to get the local file path
   //using optional chaining and using file methods like [n] n for option or property and 
   ///.path property

   const localPathavatar= req.files?.avatar[0]?.path;
   const localPathCoverImage= req.files?.coverImage[0]?.path;
   if(!localPathCoverImage|| !localPathavatar){
    throw new apiError(400,'upload both images cover and avatar. Required*')
   }

   ///logic for upload on cloudinary yes its just a calling function

   const avatar= await uploadOnCloudinary(localPathavatar)
   
   const coverImage= await uploadOnCloudinary(localPathCoverImage)

   if(!avatar || !coverImage){
    throw new apiError(400,'upload images failed')

   }

   //creating user in mongodb 

 const user= await  User.create({
    fullname,
    password,
    username,
    email:email.toLowerCase(),
    avatar:avatar.url,
    coverImage: coverImage.url
   })

   ///finding the user that we save and deduct the token and password as we want
   //to show to usr and then show all info to user by using select method
   const createdUser= await User.findById(user._id).select(
    "-refreshToken -Password"
   )

   if (!createdUser) {
        throw new apiError(500,'Something went wrong while creating account')
   }
   //if aal set then sending the satus code as we see in the postman and then a response
   //in form of json data and in it as we created  a class that we import apiResponse
   //and passing params

   return res.status(201).json(
    new apiResponse(
        200,
        createdUser,
        "succesfuly created the account les go"
    )
   )

  
})
 

//loggout method
const logoutUser= asyncHandler(async(req,res)=>{
 await User.findByIdAndUpdate(
  req.user._id,
  {
   $set:{refreshToken:undefined} 
  },
  {
    new:true
  }

 )

 const options={
  httpOnly:true,
  secure:true
 }
 return res
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new apiResponse(200, {}, "loggedout successfully"))

})
//exporting the functions or methods
export {
  loginUser,
  registerUser,
  logoutUser
}