import mongoose from "mongoose"
import {Comment} from "../model/comment.modal.js"
import { Video } from "../model/video.modal.js"
 import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
//done
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video

    // get video id from params and also from the query get page and limit of the comments
    //find whether that video exists
    //using aggregate 
    //match where video = video Id
    //lookup user using foreign and local fields
    //as videocomments
    //flattern that
    //project the username full name avatar and comment
    //sort by acesnding
    //limit the pagination
    //ok we use aggregate paginate which get aggregate oject whick is actually object which has our whole query and also options which catually have limit and the page no
    //return response we use aeait there cause actuallly it execute there


try {
    
        const {videoId} = req.params
        const {page = 1, limit = 10} = req.query
    
        const isVideo= await Video.findById(videoId)
    
         if(!videoId){
            throw new apiError(
                404,
                "please enter the Video Id"
            )
        }
        if(!isVideo){
            throw new apiError(
                404,
                "not found the video with this id plelase enter a valid Id"
            )
        }
       
        const aggregate= Comment.aggregate([
            {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"allComments"
            }
        },
        {
            $unwind:"$allComments"
        },
        {
            $project:{
                 content:1,
                allComments:{
                    username:1,
                    fullname:1,
                    avatar:1
                }
            }
        },
        {
            $sort:{createdAt:-1}
        }
    ])
    
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    
    }
    const paginatedComments= await Comment.aggregatePaginate(aggregate,options)
    if(aggregate.length==0){
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {paginatedComments},
                "no comments yet"
            )
        )
    }
    else{
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {paginatedComments},
                `sucessfully get the comments: ${(await aggregate).length}`
            )
         )
    }
    
} catch (error) {
    throw new apiError(
        500,
        error?.message||"oops server Side Error please report bug"
    )
}


})
//done
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    //get video Id from pram
    //get user who is auth
    // get the content he want to write get from .body
    //now ad that comment using create 
    //return response


try {
        const {videoId}= req.params
        const {content}= req.body
        const user= req.user?._id
        
    
        if(!content){
            throw new apiError(
                400,
                "Enter the comment please"
            )
        }
    
        if(!videoId){
            throw new apiError(
                404,
                "give the video ID please"
            )
        }
    
        const isVideo= await Video.findById(videoId)
    
        if(!isVideo){
            throw new apiError(
                400,
                "No video found by this Id"
            )
        }
    
    const comment= await Comment.create({
        content:content,
        owner:user,
        video:videoId
    })
       
    if(!comment){
        throw new apiError(
            400,
            " Error while Creating the comment please try later"
        )
    }
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {comment},
            "sucessfully commneted on the video"
        )
    )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"oops server Error please Report the bug"
    )
}

    
})
//done
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    //get video id from params
    //get user by id
    //get content
    //check all the things
    //update the video comment by findby id and update(id,{},{NEW:TRUE})
    //return response
    //using commnet id in params

try {
        const {newComment}= req.body
        const {commentId}=req.params
        const user=req.user?._id
    
        if(!newComment){
            throw new apiError(
                400,
                "please enter new comment"
            )
        }
    
        if(!commentId){
            throw new apiError(
                400,
                "please enter the comment id"
            )
        }
    
    
        const isComment= await Comment.findById(commentId)

    
        if(!isComment){
            throw new apiError(
                404,
                "no comment found"
            )
        }
    
    
        const updateComment= await Comment.findByIdAndUpdate(commentId,{
           $set:{
             
             content:newComment
    
           }
        })
    
        if(!updateComment){
            throw new apiError(
                400,
                "error while we updating your commnet please try again later"
            )
        }
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {updateComment},
                "updated the comment sucessfully"
            )
        )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"server side error while updating please report the bug"
    )
}
})
//Done
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    //get the comment id from the params
    //check wheater it exost if yes
    //delete by id
    //return res

try {
        const {commentId} = req.params
        const user= req.user?._id
    
        if(!commentId){
            throw new apiError(
                400,
                "enter CommentId"
    
            )
        }
    
        const comment= await Comment.findById(commentId)
        
        if(comment){
            if(comment.owner.toString()==user.toString()){
            const isDeleted= await Comment.findByIdAndDelete(commentId)
            if(!isDeleted){
                throw new apiError(
                    400,
                    "While deleteing we got into something bad so please try again"
                )
            }
            return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    {isDeleted},
                    "sucessfully deleted the comment"
                )
            )
        }
        else{
            throw new apiError(
                400,
                "not authorized to delete this"
            )
        }
    
        }else{
            throw new apiError(
                404,
                "no comment found by this id"
            )
        }
} catch (error) {
    throw new apiError(
        500,
        error?.message||"oops we broke! please report this bug"
    )
}
    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }