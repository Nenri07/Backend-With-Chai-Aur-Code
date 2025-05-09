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
// done
const getVideoById = asyncHandler(async (req, res) => {
  try {
      const { videoId } = req.params
      //get video id form the url through request.params
      //search video by id from model 
      //return response
  
      if(!videoId){
          throw new apiError(
              400,
              "error while reciving data "
          )
      }
      const video= await Video.findById(videoId)
      if(!video){
          throw new apiError(
              402,
              "error while fetching data from server try again later"
          )
      }
  
      return res
      .status(200)
      .json(
          new apiResponse(
              200,
              {video},
              "video fetched successfully"
          )
      )
  
  } catch (error) {
    throw new apiError(
        500,
        error?.message
        || "Server Side Request failed Sorry for this time try again later if error presist contact on umer@webape.co"
    )
    
  }


    
    //TODO: get video by id

})
//done
const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    //first get id
    //find video by id
    //check login user is video owner or not
    //get title and description by req.body
    //get thumbnail from req.files.path
    //upload thubumbnail on cloudinary and get cloudinary path by .url
    // update the document by model.findbyIdandupdate(id,{},{new:true} for modified document to be retuned)

 try {
       const { videoId } = req.params
       if(!videoId){
           throw new apiError(
               400,
               "client side error"
           )
       }
       const videotoUpdate=await Video.findById(videoId)
       
       const user= req.user?._id
      
       
       if(!(videotoUpdate.Owner!==user)){//
           throw new apiError(200,"You are not authorized to update this")
       } 
   
       const {title, description}=req.body
       if(!(title || description)){
           throw new apiError(
               400,
               "please give title and description"
           )
       }
   
       const newthumbnail=req.file?.path
       
       if(!newthumbnail){
           throw new apiError(
               400,
               "please give thumbnail"
           )
       }
   
       const updatedurl=await uploadOnCloudinary(newthumbnail)
       if(!updatedurl.url){
           throw new apiError(
               400,
               "there is an error while uploading thumbnail to server . try again later"
           )
       }
   
       const updatedvideo=await Video.findByIdAndUpdate(videoId,{
           Title:title,
           Description:description,
           thumbnail:updatedurl.url
       },
   {
       new:true
   })
   
   if(!updatedvideo){
       throw new apiError(400,
           "Error in the server updation"
       )
   }
   
   return res
   
   .status(
       200
   )
   .json(
       new apiResponse(200,
           updatedvideo,
           "suceessfully updated"
       )
   )
      
 } catch (error) {
    throw new apiError(
        502,
        error?.message||"internal server error contact devs"
    )
 } 





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