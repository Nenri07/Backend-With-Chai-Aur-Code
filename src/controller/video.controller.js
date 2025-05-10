import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../model/video.modal.js"
import {User} from "../model/user.modal.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloduinary.js"

//done
const getAllVideos = asyncHandler(async (req, res) => {


    //ok so req.query do just get query of url after?
    //check wheather userId exist or not cause all tother have default values
    //now from Video document using agregate
    //match the document (where clause means)
    //use $or as for any of the condition get correct it will collect the data of documents
    // use $regex:query ,$options:"i" i means wheather capital or small case it will find all case insentive
    //now lookup with user document(like join in sql) and name the field
    //now project the columns(fields) we want using 1
    //convert to object cause its array using unwind:
    //sortby using the ascending descending sorttype -1 for deccending and 1 is for accending
    //now paginnate like if we are on page 2 we will $skip previous results
    //$limit the page content like 10 rows 
    //return response

try {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
        if(!userId){
            throw new apiError(
                400,
                "not authorized to check videos"
            )
        }
      console.log(req.query);
      
        const videos= await Video.aggregate([
    
           {
            $match:{
                $or:[
                    {Title:{$regex:query,$options:"i"}},
                    {Description:{$regex:query,$options:"i"}}
                ]
            }
    
           }, 
           {
            $lookup:{
                from:'users',
                localField:'Owner',
                foreignField:"_id",
                as:"createdBy"
            }
    
           },
           {
            $unwind:"$createdBy"
           },
           {
            $project:{
                videoFile:1,
                Title:1,
                Description:1,
                thumbnail:1,
                createdBy:
                  {
                    username:1,
                    fullname:1,
                    avatar:1
                  }  
            }
    
           },
           {
            $sort:{ 
            [sortBy]:sortType==='asc' ? 1:-1
            }
           },
           {
            $skip:(page-1)*limit
           },
           {
            $limit: parseInt(limit)
           } 
        ])
    console.log(videos);
    
        if(!videos){
            throw new apiError(
                400,
                "Error while fetching videos from db"
            )
    
        }
    
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {videos},
                "sucessfully feteched the user videos"
            )
        )
        
} catch (error) {
    throw new apiError(
        error?.message||"Error while fetching from server please try again later"
    )
}
    
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
// done but have to do delete from cloudinary
const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    //get video by id
    //video.thumbnail+videFile delete from cloudinary
    //delete the video from the db using findbyidandDelete using video id

        try {
            const { videoId } = req.params
            const loggedinuser=req.user?._id
            const video= await Video.findById(videoId)
    
            if(!videoId){
                throw new apiError(
                    400,
                    "bad request client side error no video found "
                )
            }


            if(!(video.Owner!==loggedinuser))
            {
                throw new apiError(
                    402,
                    "you aren ot authorized to delete this video"
                )
            }

    
            const videotoDelete=await Video.findByIdAndDelete(videoId)
    
            if(!videotoDelete)
            {
                throw new apiError(
                    400,
                    "server side error while removing the video"
                )
            }
    
            return res
            .status(200)
            .json(
                new apiResponse(
                    500,
                    {videotoDelete},
                    "successfully delted the video"
                )
            )
    
        } catch (error) {
            throw new apiError(
                500,
                error?.message|| "server side error please try again later"
            )
        }
})
//done
const togglePublishStatus = asyncHandler(async (req, res) => {
    //find video by id and update using model.findbyidandUpdate
 try {
       const { videoId } = req.params
       const user= req.user?._id
       const {Owner,isPublished}=await Video.findById(videoId)
   
   
       if(!videoId){
           throw new apiError(
               403,
               "client side error while performing  toggling"
   
           )
       }
   
       if(Owner.toString()!==user.toString()){
           throw new apiError(
               403,
               "not authorized to do this action"
           )
       }
       const toggledVideo=await Video.findByIdAndUpdate(videoId,{
           $set:{
               isPublished:!isPublished
           }
   
       },{
           new:true
       })
   
       if(!toggledVideo){
           throw new apiError(
               403,
               "video not found"
           )
       }
   
       return res
       .status(200)
       .json(
           new apiResponse(
               200,
               {toggledVideo},
               "video is published successfully"
               
           )
       )
 } catch (error) {
    throw new apiError(
        502,
        error?.message||"bad request server side Error try again later"
    )
    
 }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}