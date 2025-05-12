
import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../model/tweet.modal.js"
import {User} from "../model/user.modal.js"
// import {ApiError} from "../utils/ApiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
//done
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //get from body the content 
    // identify the owner by loggedin user
    //save into db
    //return respomse


    try {
        const {content} =req.body
       
        
        
        const Owner= req.user?._id
    
        if(!content||!Owner){
            throw new apiError(
                400,
                "Enter the content to post"
            )
        }
    
        const tweet= await Tweet.create({
            content:content,
            owner:Owner
        })
    
        if(!tweet){
            throw new apiError(400,
                "there is an error while creating tweet .wait and try again "
            )
        }

        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {tweet},
                "successfully created the tweet"
            )
        )
        
    } catch (error) {
        throw new apiError(500,
            error?.message||" having error in server side please contact admin"
        )
    }
})
//done
const getUserTweets = asyncHandler(async (req, res) => {

    // TODO: get user tweets
    //get logged in user id
    //using aggregate([{},{}]) first match where Owner== loggedin user Or
    //we use modal.find({}).sort({})
    //return response

    const user= req.user?._id
    
    if(!user){
        " log in to get access"
    }

    const userTweets=  await Tweet.find({owner:user}).sort({createdAt:-1})
    if(!userTweets){
        throw new apiError(
            400,
            "no tweets found"
        )
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {userTweets},
            "successfully fetched the user tweets"

        )
    )
})
//done
const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // first get tweet id from req.params
    //fetech the tweet data
    //check wheather curent user is the Owner
    //get the content
    //set using aggregate
    //return success response

try {
        const user=req.user?._id
    
        const {content}=req.body
    
        const {tweetId}=req.params

        
        if(!tweetId){
            throw new apiError(
                400,
                "sorry no tweet found with this id"
            )
        }
    
        const tweetData= await Tweet.findById(tweetId)
        if(!tweetData){
            throw new apiError(
                400,
                "we cant reach at the tweet at the moment, try again later"
            )
        }
    
    
        if (tweetData.owner.toString()!==user.toString()) {
            throw new apiError(400,
                "you are not authorized to edit this tweet"
                
            )
            
        }
    
        const updatedTweet= await Tweet.findByIdAndUpdate(tweetId,{
           $set: {content:content}
    
        },
        {
            new:true
        }
        )
    
        if(!updatedTweet){
            throw new apiError(
                400,
                "there is something wrong while updating please try again later"
            )
        }
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {updatedTweet},
                "successfully updated the tweet"
            )
        )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"there is server side error please be patient we are solving it."
    )
    
}

})
//done
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    //get id from param
    //get user id from req.user
    // match Owner and user
    //using findbyidanddelete Delte the tweet
    //return response

 try {
       const {tweetId}=req.params
       const user=req.user?._id
   
       if(!tweetId){
           throw new apiResponse(
               400,
               "enter the tweet id in params dev"
           )
       }
   
          if(!user){
           throw new apiResponse(
               400,
               "no loggedIn user"
           )
       }
   
       const tweetData=await Tweet.findById(tweetId)
       if(!tweetData){
           throw new apiError(
               400,
               "No tweet find by this id"
           )
       }
   
       const deletedTweet=await Tweet.findByIdAndDelete(tweetId)
   
       if(!deletedTweet){
           throw new apiError(
               400,
               "Something went wrong while deleting "
           )
       }
       
       return res
       .status(200)
       .json(
           new apiResponse(
               200,
               deletedTweet,
               "sucessfully deleted the tweet"
           )
       )
 } catch (error) {
    throw new apiError(
        error?.message||"Server is busy at the moment please contact dev"
    )
    
 }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
