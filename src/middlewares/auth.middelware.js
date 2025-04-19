import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
export const verifyJwt = asyncHandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.accessToken||req.header("authorization")?.replace("bearer","")
 
    if (!token){
     throw new ApiError(401,"unauthorized request")
    }
   const decodertoken = jwt.verify(token,process.env.JWT_SECRET)
 
   const user = await User.findById(decodertoken?._id).select("-password -refreshToken")
 
   if (!user) {
     //discuss about frontend
     throw new ApiError(401,"Invalid token")
   }
   req.user = user;
   next()
   } catch (error) {
     throw new ApiError(401,error?.message,"invalid access token")
   }

}) 


