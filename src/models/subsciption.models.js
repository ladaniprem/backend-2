import mongoose,{model, Schema}from "mongoose";

const subsciptionSchema = new Schema({
    subsciber:{
        type:Schema.Types.ObjectId,// one who is subscribing
        ref:"User"
    },
    channel:{
 type:Schema.Types.ObjectId,// one whom to subcriber is subscribing 
 ref:"User"
    },
},{timestamps:true}
)


export const subsciption = mongoose.model("subsciption",subsciptionSchema)