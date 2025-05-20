import mongoose from "mongoose"
import { Video } from "../model/video.modal.js"
import {Like } from '../model/like.modal.js'
import {Comment} from '../model/comment.modal.js'
import {Subscription} from '../model/subscription.modal.js'
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//done
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    //scenario here i get more than 2 backend calls that i feel make system lil bit laggy
    //videos length and views are in one 
    //likes and subsriber in one
    //$faucet i got in mind for single uery optemization
    //

    //get user id from re.user
    //check if there is user who exist or not fact check
    //first match using aggregate the owner we go videos
    //we will use promise.all for assyncronizable feteced to optemized the time  of quries
 try {
       const user= req.user?._id
       const[totalVideos,totalViews,totalSubscribers,totalLikes,totalComments]= await Promise.all([
           Video.countDocuments({
               Owner:user
           }),
           Video.aggregate([{
             $match:{
               Owner:user
             }  
           },{
               $group:{
                   _id:null,
                   totalviews:{$sum:"$views"}
               }
           }]),
   
           Subscription.countDocuments({
       channel:user
   }),
   
           Video.aggregate([{
               $match:{
                   Owner:user
               }
           },
      {
           $lookup:{
               from:"likes",
               localField:"_id",
               foreignField:"video",
               as:"totalLikes"
           }
      },
      {
       $unwind:"$totalLikes"
      },
      {
       $project:{
           totalLikes:{
               video:1,
               likedBy:1
           }
   
       }
      }
   ]),
   
   
   
   Video.aggregate([
       {
           $match:{
               Owner:user
           }
       },
       {
           $lookup:{
               from:"comments",
               localField:"_id",
               foreignField:"video",
               as:"totalComments"
           }
   
       },
       {
           $unwind:"$totalComments"
       },
       {
           $project:{
               totalComments:{
                   content:1,
                   owner:1,
                   video:1
               }
           }
       }
   
   ])
   
   
       ]) 
   
   if(totalVideos[0]===null|| totalViews[0]===null||totalComments===null||totalSubscribers===null||totalLikes===0){
       throw apiError(404,
           "Null value in the params"
       )
   }
     const viewsCount = totalViews[0]?.totalviews || 0;

       return res
       .status(200)
       .json(
           new apiResponse(
               200,
               {
              totalVideos,
              totalVideos:totalVideos,
                totalViews: viewsCount,
                totalSubscribers,
                totalLikes: totalLikes.length,
                totalLikesData:totalLikes,
                totalComments: totalComments.length,
                totalCommentsData:totalComments
               },
               "feteched videos"
           )
       )
 } catch (error) {
    throw new apiError(
        500,
        "Error in the serverSide contact dev"
    )
 }
    
})

//done
const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    //get user id by req.user
    //vidoes where owner= user
    //return resp using pagination and sorting 

try {
        const user= req.user?._id
        const {page=1,limit=5}=req.query
        const videos=await Video.aggregate([{
            $match:{
                Owner:user
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:parseInt(limit)
    
        }
    ])
        if(!videos){
            throw new apiError(
                400,
                "error while fetching data"
            )
        }
    
    if(videos.length===0){
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {videos},
            "you dont have posted a single video yet"
        )
    )
    }else{
        return res
        .status(200)
        .json(
            new apiResponse(200,
                {videos},
               ` ${videos.length} videos fetched sucessfully`
    
            )
        )
    }
} catch (error) {
    throw new apiError(
        500,
        error?.message||"While feteching our server runs out pleasse contact dev"
    )
}



})

export {
    getChannelStats, 
    getChannelVideos
    }