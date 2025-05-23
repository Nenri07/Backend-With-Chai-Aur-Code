
import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../model/playlist.modal.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../model/user.modal.js"
import {Video} from "../model/video.modal.js";

//done
const createPlaylist = asyncHandler(async (req, res) => {

    //GET NAME AND DESCIRiption from Req.Body
    //validate both
    //get the login user though req.user
    //create the playlist
    //return resp




try {
    
        const {name, description} = req.body
    
    
    if(!name || !description){
       throw new apiError(
        400,
        "give the name and description for the playlist"
       )
    }
    
    const user= req.user?._id
    const playlist= await Playlist.create({
        name:name,
        description:description,
        owner:user
    })
    
    if(!playlist){
        throw new apiError(
            400,
            "while creating playlist we got up into troble"
        )
    }
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {playlist},
            "created the playlist successfully"
        )
    )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"server side issue please devs"
    )
}

})

//done
const getUserPlaylists = asyncHandler(async (req, res) => {
    //get userId from params
    //find if any playlist with the owner= userId
    //return values
    
 try {
       const {userId} = req.params
       
       if(!userId){
           throw new apiError(
               400,
               "Enter the userID"
           )
       }
   
       const isUser= await User.findById(userId)
   
       if(!isUser){
           throw new apiError(
               404,
               "User wit this id ,Not Found"
           )
       }
   
       const userPlaylists= await Playlist.find({
           owner:new mongoose.Types.ObjectId(userId)
       })
      
       
       if(userPlaylists.length===0){
           return res
           .status(200)
           .json(
            new apiResponse(
                200,
               userPlaylists,
               "there is no playlist created")
               
           )
       }
       else{
           return res
           .status(200)
           .json(
            new apiResponse(
                 200,
               userPlaylists,
               `user playlist feteched sucessfully with videos count of ${userPlaylists[0].videos.length}`
            )
              
           )
       }
 } catch (error) {
    throw new apiError(
        500,
        error?.message||"server side error please contact dev"
    )
 }

})
//done but took 3 hours to just get that i dont write error code(500)
const getPlaylistById = asyncHandler(async (req, res) => {
    //get playlist id in param 
    //search in the playlist
    //return res
    //cross check values

try {
        const {playlistId} = req.params
    
        if(!playlistId){
            throw new apiError(
                400,
                "please give the playlist id"
            )
        }
    
         if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new apiError(400, "Invalid playlist ID format.");
    }
        const isPlaylist= await Playlist.findById(playlistId)
        
        
        if(!isPlaylist)
        {
            throw new apiError(
                404,
                "no playlist fond with this id"
            )
        }
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                isPlaylist,
                "sucessfully fetched the playlist"
            )
        )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"backend server problem! please contact the bug"
    )
}
})
//done
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //get video id and playlist id
    //from video check weather that video exists if yes than check ehtaher playlist exists or not 
    //if both yes in the playlist updateOne match the playlist id
    //push the video into the videos array
    //retun res
try {
        const { videoId,playlistId} = req.params
    
        if(!playlistId|| !videoId){
            throw new apiError(
                400,
                "Please Enter the Video and playlist Ids"
            )
        }
    
        const [isPlaylist,isVideo]= await Promise.all(
            [
             Video.findById(videoId),
             Playlist.findById(playlistId)   
            ]
        )
        if(!isPlaylist||!isVideo){
            throw new apiError(
                404,
                "playlist or video not found please enter valid id"
            )
        }
        const addedVideo= await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push:{
                    videos:new mongoose.Types.ObjectId(videoId)
            }
            },
            {
                new:true
            }
        )
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            addedVideo,
            "video added in playlist successfully"
        )
    )
} catch (error) {
    throw new apiError(
        500,
        error?.message||"there is a problem in server please report bug"
    )
}


})
//done
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {


    //get the playlist amd the videoId from the user and verify
    //use same update but now use pull 
    //return response
    try {
        const {playlistId, videoId} = req.params
    
        if(!playlistId||!videoId){
            throw new apiError(
                400,
                "Enter the playlist and video id"
            )
        }
    
        const [isPlaylist,isVideo]= await Promise.all(
            [
                Playlist.findById(playlistId),
                Video.findById(videoId)
            ]
        )
        if(!isPlaylist|| !isVideo){
            throw new apiError(
                404,
                "Enter valid Playlist and video Id"
            )
        }
    
        const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId,
            {
                $pull:{
                    videos:new mongoose.Types.ObjectId(videoId)
                }
    
            },
            {
                new:true
            }
        )
    
        
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedPlaylist,
                "updated playlist successfully"
            )
        )
    } catch (error) {
        throw new apiError(
            500,
            error?.message||"server side error please repost bug"
        )
    }

})
//done
const deletePlaylist = asyncHandler(async (req, res) => {
    //getPlaylist id from param
    //delete it from the playlist schema
    //return

try {
    
            const {playlistId} = req.params
    
            if(!playlistId){
                throw new apiError(
                    400,
                    "Enter the Playlist Id"
            
                )
            }
            
    
            const delPlaylist= await Playlist.findByIdAndDelete(playlistId)
            
            if(!delPlaylist){
                throw new apiError(
                    404,
                    "no playlist found by this id")
            }
    
            return res
            .status(200)
            .json( 
                new apiResponse(
                    200,
                    delPlaylist,
                    "playlist deleted successfully"
                )
            )
} catch (error) {
    throw new apiError(
        500,
       error?.message|| "while deleting there is a server error"
    )
}

})
//done
const updatePlaylist = asyncHandler(async (req, res) => {


    // get description and name and id from params and body
    // validate
    // in playlist findbyidandupdate and there set values
    //return response
 try {
       const {playlistId} = req.params
       const {updtname, updtdescription} = req.body
       const user= req.user?._id
   
       if(!playlistId){
           throw new apiError(
               400,
               "Enter the id of Playlist"
           )
       }
        if(!updtname||!updtdescription){
           throw new apiError(
               400,
               "Enter name and description"
           )
   
       }
        const playList= await Playlist.findById(playlistId)
       if(!playList){
        throw new apiError(
            404,
            "no playlist found by this id"
        )
       }
     
      
       if(!(playList.owner!=user)){
           throw new apiError(
               404,
               "not access to this playlist .please authorized to be Owner first"
           )
       }
   
       const updatedPlaylist= await Playlist.findByIdAndUpdate(playlistId,{
           $set:{
               name:updtname,
               description:updtdescription
           }
          
       },
        {
            new:true
        }
    )
       if(!updatedPlaylist){
           throw new apiError(
            403,
               "while updating server slows down please try later"
           )
       }
   
       return res
       .status(200)
       .json(
           new apiResponse(
               200,
               {updatedPlaylist},
               "updated playlist name and description sucessfully"
           )
       )
 } catch (error) {
    throw new apiError(
        500,
        error?.message||"Server side error please contact dev"
    )
 }
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
