import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../model/like.modal.js"
import { Tweet } from "../model/tweet.modal.js"
import {Video} from "../model/video.modal.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
//Done
const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    //get the user id
    // from the like check weather with that user and video id any record is available 
    //if yes delete that
    //else create it
    //return response

        try {
            const {videoId} = req.params
            const user= req.user?._id
    
           
    
            if(!videoId){
                throw new apiError(
                    404,
                    "please Enter the video ID"
                )
            }
    
            const isVideo= await Video.findById(videoId)
    
            if(!isVideo){
                throw new apiError(
                    404,
                    "oops no video found by this Id"
                )
            }
    
             if(!user){
                throw new apiError(
                    400,
                    "Please log In to like or dislike"
                )
            }
    
            const isLiked= await Like.findOne({
                likedBy:user,
                video:videoId
            })
            const id=isLiked?._id
    
            if(isLiked){
                const unlike= await Like.findByIdAndDelete(id)
                if(!unlike){
                    throw new apiError(
                        409,
                        "while Unlike we caught up on something please try again"
                    )
                }
    
                return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        {unlike},
                        "Unliked the video successfully"
                    )
                )
            }else{
    
                const like= await Like.create({
                    video:videoId,
                    likedBy:user
                })
    
                if(!like){
                    throw new apiError(
                        400,
                        "oops we caught upto somrthing while Liking video. please try again"
                    )
                }
    
                return res
                .status(200)
                .json(
                    new apiResponse(
                        200,
                        {like},
                        "video Liked Succssfully"
    
                    )
                )
            }
    
    
        } catch (error) {
            throw new apiError(
                500,
                error?.message||"Error while performing action from our side"
            )
        }
})
//Pending due to the controller not written yet
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    //get comment id
    //logged in user id


})
//done
const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet
    //get tweet ID
    //weather the user loggedIn
    //get Tweet liked by current User
    //if exist delete it
    //if not create it
    //return resp

try {
    
         const {tweetId} = req.params
         const user= req.user?._id
    
         if(!tweetId){
            throw new apiError(
                400,
                "Please Enter an tweet Id"
            )
         }
    
         const isTweet=await Tweet.findById(tweetId)
         if(!isTweet){
            throw new apiError(
                400,
                "oops no tweet found by this Id"
            )
         }
    
         const istweetliked= await Like.findOne({
            tweet:tweetId,
            likedBy:user
         })
    
         if(istweetliked){
            const unlikeTweet= await Like.findByIdAndDelete(istweetliked._id)
            if(!unlikeTweet){
                throw new apiError(
                    400,
                    "oops hung up into something when doinf unliking tweet"
                )
            }
    
            return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    {unlikeTweet},
                    "successfully unliked the tweet"
                )
            )
         }
    
    
         else{
    
            const likedTweet = await Like.create({
                likedBy:user,
                tweet:tweetId
            })
            if(!likedTweet){
                throw new apiError(
                    400,
                    "Error while liking the tweet please try later"
                )
            }
    
            return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    {likedTweet},
                    "tweet Liked Sucesfully"
                )
            )
    
    
         }
} catch (error) {
    throw new apiError(
        500,
        "the Action is not working please wait while we are fizing it"
    )
}





}
)
//Done
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    //get loggedIn user
    //from the Like constroller using agregation
    // match where likedBy= user
    //from matched looked up in the video local field   , foreignfield, as
    //flattern then
    //project the things like title description thumbnail
    //sort in ascending
    //return resp
    
try {
        const user= req.user?._id
    
        const likedVideos= await Like.aggregate([{
            $match:{
                likedBy:user
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"LikedVideos"
            }
        },
        {
            $unwind:"$LikedVideos"
        },
        {
            $project:{
                LikedVideos:{
                    Title:1,
                    Description:1,
                    thumbnail:1,
                    viwes:1,
                    Owner:1
                }
            }
        },
        
    
    ])
    if(likedVideos.length===0){
        throw new apiError(
            400,
            "no Liked Videos"
        )
    }
    else{
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {likedVideos,LikedVideos:likedVideos.length},
                "Feteched all Liked Videos Sucessfully"
            )
        )
    }
} catch (error) {
    throw new apiError(500,
        error?.message||"there is an internal Error while fetching liked videos please wait while we catch up "
    )
}

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}