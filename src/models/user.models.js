import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema ({
    username:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index: true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type: String,
        required:true,
        trim:true,
        index:true,
    },
    avatar:{
         type:String ,// cloudinary url
         required:true,
    },

    coverImage:{
        type:String ,// cloudinary url
    },
    watchHistory:[{
      type:Schema.Types.ObjectId,
      ref:"video"
}],

     password:{
        type:String,
        required:[true,`password is required`]
     },

     refreshToken:{
          type:String
     },
},
 {
    timestamps: true
});

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10)
    next();
})   // () => {} mat likhana problem hota hai kuki js me arrow function ke pas this or context pata nahi hota hai

userSchema.methods.isPasswordMatch = async function(password){
    return await bcrypt.compare(password,this.password)
} 

userSchema.method.generateAccessToken = function(){
   return jwt.sign(

    {
        _id:this._id,
        email : this.email,
        username : this.username,
        fullname: this.fullname,

    },
    process.env.ACCESS_TOKEN_SECRET ,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRE 
    }
)
}
userSchema.method.generateRefreshToken = function(){
    return jwt.sign(

        {
            _id:this._id,
    
        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRE 
        }
    )
}

export const User = mongoose.model("User",userSchema)

// JWT (JSON Web Token) - Compact, URL-safe authentication/authorization bearer token format
// JWT is used for securely transmitting information between parties as a JSON object
// The information can be verified and trusted because it is digitally signed                    
