import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../model/video.modal.js"
import {User} from "../model/user.modal.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloduinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})
//done
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    /// get data from the front end Title, description and video
    /// req.body for form text content req.files for uploaded file related things
    // uploaded file path and than upload that to cloudinary
    // cloudinary give back something which is meta data to the file now from there we have to 
    // extract cloudinary path of video and thumbnail from the cloudinary given object
    //cloudinary object.url for video and image thumbnail
    // now save the data in db by model.create{in sequence files} than store into the object and send in response the object as susccedd
    //handle odd things like errors 


    try {
        const {title,description} =req.body
      
        if (!title|| !description) {
            throw new apiError(
                400,
                "Client side error Enter Title and Details"
            )
                
        } 
            
            const videoPath= req.files?.videoFile[0].path
            if (!videoPath) {
               throw new apiError(
                    400,
                    "error requesting file to upload"
                )
                
            } 
                const cloudinaryUrl=await uploadOnCloudinary(videoPath)

                if (!cloudinaryUrl.url) {
                   throw new apiError(
                        402,
                        "Server has issue on uploading file"
                    )
                    
                } 
                    const thumbnailpath= req.files?.thumbnail[0]?.path
                    if (!thumbnailpath) {
                        throw new apiError(
                            402,
                            "Error uploding the file error while uploading from client"
                        )
                        
                    } 
                        const cloudinarythumbnail=await uploadOnCloudinary(thumbnailpath)
                        if (!cloudinarythumbnail.url) {
                           throw new apiError(
                                409,
                                "Server side error while uploading the file"
                            )
                        }
                            
                        
                            const saveVideo= Video.create({
                               videoFile: cloudinaryUrl.url,
                                Owner:req.user._id,
                              thumbnail:cloudinarythumbnail.url,
                                Title:title,
                                Description:description,
                                duration:cloudinaryUrl.duration
                            })

                            if(saveVideo){


                            return res
                            .status(200)
                            .json(
                               new apiResponse(
                                    200,
                                    {saveVideo},
                                    "successfully uploaded video"
                                )

                            )}

    } catch (error) {
        throw new apiError(
            502,
            error?.message || "server side error while uploading file to cloud"
        )
        
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}