import mongoose ,{Schema} from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const commentSchema= new Schema({
 content:{
    typeof:
    String,
    required:true},
owner:{
    typeof:Schema.Types.ObjectId,
    ref:"User"
},
video:{
    typeof:Schema.Types.ObjectId,
    ref:"Video"
}

},{timestamps:true})

commentSchema.plugin(mongooseAggregatePaginate)


export const Comment=mongoose.model("Comment",commentSchema)