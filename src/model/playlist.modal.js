import mongoose,{ Schema } from "mongoose";

const playlistSchema= new Schema({
    name:{
        typeof:String,
        required:true
    },
    description:{
        typeof:String,
        required:true
    },
    videos:[{
        typeof:Schema.Types.ObjectId,
        ref:"Video"
    }],
    owner:{
        typeof:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})


export const playList=mongoose.model("playList",playlistSchema)