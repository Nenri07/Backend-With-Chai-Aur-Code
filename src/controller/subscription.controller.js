import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../model/user.modal.js"
import { Subscription } from "../model/subscription.modal.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//Done
const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    //get channel ID
    //user id from req.user
    //check whether the user subscribed it if not
    //check whther subscriber is on his own channel or he is just on other channel
    //create the subscribtion
    //check if subscribed delete the subscribtion
    //return response

       try {
         const {channelId} = req.params
         const user=req.user?._id
 
         if(!user)
         {
             throw new apiError(
                 400,
                 "please authorize to perform this action"
             )
         }
           if(!channelId)
         {
             throw new apiError(
                 400,
                 "please provide a channelId"
             )
         }
 
         if(user.toString()===channelId.toString()){
             throw new apiError(
                 400,
                 'you cant sub or unsub to your Own Account'
             )
 
         }
 
         const isChannel= await User.findById(channelId)
         if(!isChannel){
             throw new apiError(
                 400,
                 "oops!channel not found"
             )
         }
 
         const unSub= await Subscription.findOneAndDelete({
             channel:channelId,
             subscriber:user
         })
 
         if(!unSub){
 
             const Sub= await Subscription.create({
                 channel:channelId,
                 subscriber:user
             })
             return res
             .status(200)
             .json(
                 new apiResponse(
                     200,
                     {Sub},
                     "successfully subscribed to the channel"
                 )
             )
         }
 
 
 return res
 .status(200)
 .json(
     new apiResponse(
         200,
         {unSub},
         "Unsubbed Successfully"
     )
 )
 
       } catch (error) {
        throw new apiError(
            500,
            error?.message|| "bash!!! while doing this action we got stuck into something. please try again later"
        )
       }


    




})

// controller to return subscriber list of a channel
//done
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //get channelid
    //fact check weather channel(user) exists or not
    //from subscribers search where channel=channelId
    //now lookup in the users where user id = subscriber
    //flatter into json formate
    //then project the field you want to 
    //return value
    
try {
        const {channelId} = req.params
    
        if(!channelId){
            throw new apiError(
                400,
                "Enter the channel id "
            )
        }
    
        const isChannel= await User.findById(channelId)
        if(!isChannel){
            throw new apiError(
                400,
                "Channel not found"
            )
        }
    
        const getSubs= await Subscription.aggregate([
            {$match:{
                channel:new mongoose.Types.ObjectId(channelId)
    
            }}
            ,
            {
                $lookup:{
                    from:"users",
                    localField:"subscriber",
                    foreignField:"_id",
                    as:"subscribers"
                }
    
            },
            {
                $unwind:"$subscribers"
            },
            {
                $project:{
                    subscribers:{
                        _id:1,
                        username:1,
                        fullname:1,
                        avatar:1
                    }
                }
            }
        ])
    
        if(getSubs.length===0){
            return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {getSubs},
                "no subs for this channel found"
            )
        )
           
        }
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {getSubs},
                "feteched subs successfully"
            )
        )
} catch (error) {
    throw new apiError(
        500,
        "there is something hastling in system , please try again later"
    )
    
    
}

})

// controller to return channel list to which user has subscribed
//done
const getSubscribedChannels = asyncHandler(async (req, res) => {
    //get susbcriber id
    //whher that subscriber is registered or not
    //fron the Subscription check /match where subscriber=susbcriberID
    //lookup from the user where _id = susbcriber id
    //flatter it
    //project it
    //return
try {
        const { subscriberId } = req.params
    
        if(!subscriberId){
            throw new apiError(
                400,
                "Enter the SubscriberId"
            )
        }
        const isSubscriber= await User.findById(subscriberId)
    
        if(!isSubscriber){
            throw new apiError(
                400,
                "no Subscriber found with this id"
            )
        }
    
        const getChannels= await Subscription.aggregate([{
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
    
        }
        ,
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channels"
            }
        },
        {
            $unwind:"$channels"
        },
        {
            $project:{
                channels:{
                    _id:1,
                    username:1,
                    fullname:1,
                    avatar:1
                }
            }
        }
        ])
    
        if(getChannels.length===0){
           return res
           .status(200)
           .json(
            new apiResponse(
                200,
                {getChannels},
                "you havent sub to any channel yet"
            )
           )
           
        }
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {getChannels},
                "feteched channels sucessfully"
            )
        )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"Bad request Please contact the dev"
    )
}

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}