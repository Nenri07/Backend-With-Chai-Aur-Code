import {asyncHandler} from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js';
import { User } from '../model/user.modal.js';
import { uploadOnCloudinary } from '../utils/cloduinary.js';
import  {apiResponse}  from '../utils/apiResponse.js';
// import { apiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
// import { apiResponse } from '../utils/ApiResponse.js';
//method to generate access and refresh token
// const genrateAccessandRefreshtoken= async(userid)=>{
//  try {


//   const user= await User.findById(userid)
//   // console.log(user);
//   try {
    
//     // const accessTokens= user.AccessTokengenerate()
//   const refreshTokens=user.RefreshTokengenerate()
//   console.log(refreshTokens);
  
//   } catch (error) {
//     console.log("this is token error trace back",error);
    
//   }
  
  

//   user.refreshToken=refreshTokens
  
//  await  user.save({validateBeforeSave:false})
//  return{accessTokens,refreshTokens}

//  } catch (error) {
//   throw new apiError(500,'oops Server side error sorry')
  
//  }

// }
const generateAccessAndRefreshToken = async(userId) => {
  
  try {
      const user = await User.findById(userId)
      if (!user) {
          throw new apiError(404, "User not found")
      }

      // Generate tokens
      const accessToken = user.AccessTokengenerate()
      const refreshToken = user.RefreshTokengenerate()

      // Update user's refresh token
      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }

  } catch (error) {
      console.error("Token generation error:", error)
      throw new apiError(500, "Something went wrong while generating tokens")
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

   const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id)
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
   $unset:{refreshToken:1} 
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

//refreshing the session for Accesstoken

const refreshAccessToken=asyncHandler(async(req,res)=>{
  //first we have to get token of the user who is signnedout
  const incomingToken=req.cookie.refreshToken || req.body.refreshToken
  if(!incomingToken){
    throw new apiError(401,"unauthorized access")
  }
  //verify the jwt
 try {
  const decodedToken=  jwt.verify(
     incomingToken,
     process.env.REFRESH_TOKEN_SECRET
   )
   //findg user from db
   const user=await User.findById(decodedToken?._id)
   if(!user){
     throw new apiError(401,"unauthorized access not valid user")
   }
   if(incomingToken!=user?.refreshToken){
     throw new apiError(401,"nah sassion is not for this user")
   }
   //now refreshing in db new genrated token
 
   const options={
     httpOnly:true,
     secure:true
   }
 // generating new token
   const {accessToken,newRefreshToken }=await generateAccessAndRefreshToken(user._id)
 
 
   return res
   .status(200)
   .cookie("refreshToken", newRefreshToken,options)
   .cookie("accessToken", accessToken,options)
   .json(
     new apiResponse(
       200,
       {
         accessToken,refreshToken:newRefreshToken
       },
       "session fresh now "
     )
 
   )
 
 } catch (error) {
  throw new apiError(500,"bad request by server")
  
 }
})


//chaninging currentPassword

const changeCurrentpassword=asyncHandler(async(req,res)=>{

const{oldPassword,newPassword}=req.body
const user=await User.findById(req.user?._id)
const correctPass=await user.isPasswordcorrect(oldPassword)

if (!correctPass) {
  throw new apiError(400,"Wrong old Password")
}
user.password=newPassword
await user.save({validateBeforeSave})

return res
.status(200)
.json(new apiResponse(200,"Password Chnaged Successfuly"))

})

//getCurrent User
const currentUser= asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new apiResponse(200,"user fetched succcessfully"))
})
//update account details

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {username, email}=req.body
  if(!(username ||email)){
    throw new apiError(402,"both fields are required")
  }
  const user=User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        username,
        email
      }

    },
    {new:true}

  ).select("-password")

  return res
  .status(200)
  .json(new apiResponse(
    200,
    user,
    "account ddetails updated successfully"
  )

  )
})

//update file details
const updateavatar=asyncHandler(async(req,res)=>{
 const localpath=req.file?.path

 if(!localpath){
  throw new apiError(400,"file is required for avatar")
 }

 const uploadedPath=await uploadOnCloudinary(localpath)
 if(!uploadedPath.url){
  throw new apiError(400,"Oops there is an error in server please try again later")
 }

 const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      avatar:uploadedPath.url
    }
  }
  ,
  {
    new:true
  }
 ).select("-password")
 return res
  .status(200)
  .json(
    new apiResponse(
      200,
      user,
      "successfully changed Avatar"
    )
  )
 
 
})

// uupdate coverImage
const updatCoverImage=asyncHandler(async(req,res)=>{
  const localpath=req.file?.path
 
  if(!localpath){
   throw new apiError(400,"file is required for CoverImage")
  }
 
  const uploadedPath=await uploadOnCloudinary(localpath)
  if(!uploadedPath.url){
   throw new apiError(400,"Oops there is an error in server please try again later")
  }
 
  const user= await User.findByIdAndUpdate(
   req.user?._id,
   {
     $set:{
       coverImage:uploadedPath.url
     }
   }
   ,
   {
     new:true
   }
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(
      200,
      user,
      "successfully changed CoverImage"
    )
  )
 
  
 })


// Aggreagation pipelines for channel subs count

const channelDetails=asyncHandler(async(req,res)=>{
 const {username}= req.params
 if (!username?.trim()) {
  throw new apiError(404,"not found user channel")
 }

const channel= await User.aggregate([
  {
  $match:{
    username:username?.toLowerCase()
  }
},
{
  $lookup:{
    from:"subscriptions",
    localField:"_id",
    foreignField:"channel",
    as:"subscribers"
  }
},{
  $lookup:{
    from:"subscriptions",
    localField:"_id",
    foreignField:"subscriber",
    as:"subscribeTo"
  }
},
{
  $addFields:{
    subscriberCount:{
      $size: "$subscribers"
    },
    subscribedtoCount:{
      $size: "$subscribeTo"
    },
    isSubscribed:{
      $cond:{
        if:{$in:[req.user?._id,"$subscribers.subscribe"]},
        then:true,
        else:false
      }
    }
  }
},
{
  $project:{
    username:1,
    subscriberCount:1,
    subscribedtoCount:1,
    isSubscribed:1,
    avatar:1,
    coverImage:1,
    email:1
  }
}
])
if(!channel?.length){
  throw new apiError(404,"Channel not found")
}

return res
.status(200)
.json(new apiResponse(200,
  channel[0],"feteched User info Successfully"
))


})

//watch history and sub pipeline

const getwatchHistory= asyncHandler(async(req,res)=>{
  const user= await User.aggregate([{
    $match:{
      _id:new mongoose.Types.ObjectId(req.user._id)
    }
  },
  {
    $lookup:{
      from:"videos",
      localField:"watchHistory",
      foreighnField:"_id",
      as:"watchHistoryDetails",
      pipeline:[
        {
          $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"Owner",
            pipeline:[
              {
                $project:{
                  fullname:1,
                  username:1,
                  avatar:1
                }
              }
            ]
          }
        }
        ,{
          $addFields:{
            owner:{
              $first:"$Owner"

            }
          }
        }
      ]
    }
  }
])

return res
.status(200),
json(new apiResponse(
  200,
  user[0].watchHistoryDetails,
  "fetched watch history successfully"
))
})
//exporting the functions or methods
export {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentpassword,
  currentUser,
  updateAccountDetails,
  updateavatar,
  updatCoverImage,
  channelDetails,
  getwatchHistory
}