import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
     videoFile:{          //mongodb allow to the media file to small to directly to media file store kar sakha te ho like photo,video load bi zada padta hai
       type: String,
       required: true,

     },

     thumbnail:{
        type:String, // cloudinary url
        required:true,
     },
     title:{
        type:String, 
        required:true,
     },
     description:{
        type:String, 
        required:true,
     },
     duration:{
        type:Number, 
        required:true,
     },
     views:{
        type:Number,
        default:0,
     },
     isPublished:{
        type:Boolean,
        default:true,
     },
     owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
},
{
    timestamps: true
}
)
videoSchema.plugin(mongooseAggregatePaginate) // for pagination
export const video = mongoose.model("Video",videoSchema)
