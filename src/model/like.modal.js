import mongoose ,{Schema} from "mongoose";

const likeSchema=new Schema({
    video:{
        typeof:Schema.Types.ObjectId,
        ref:"Video"
    },
    tweet:{
        typeof:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    comment:{
        typeof:Schema.Types.ObjectId,
        ref:"Comment"
    },
    likedBy:{
        typeof:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Likes=mongoose.model("Likes",likeSchema)