import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.models.js"; // Fixed model file name from user.model.js to user.models.js
import {uploadOnCloudinary} from "../utils/Cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = await user.generateAccessToken();
      const refreshToken= await user.generateRefreshToken() ;

      user.refreshToken = refreshToken;
    await  user.save({validateBeforeSave:false})

    return{accessToken,refreshToken}

   } catch (error) {
      throw new ApiError(500,"Something went wrong while generating referesh and access token");

   }
}

const registerUser = asyncHandler(async(req,res) => {
    const {fullname,email,username,password} = req.body 

    if([fullname,email,username,password].some((field) => field?.trim() === "")){
        throw new ApiError(400,"All fields are required")  
    }
     
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }
   //console.log(req.files);
    // Fixed file path handling with optional chaining
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //  const coverImageLocalPath = req.files?.coverImage?.[0]?.path; high syntax

  // simple method to check the cover image 
     let coverImageLocalPath;
     if (req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0) {
      coverImageLocalPath = req.files.coverImage[0].path;
     }
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if (!avatar?.url) {
        throw new ApiError(400, "Avatar upload failed")
    }
    
    let coverImage = null;
    if(coverImageLocalPath){
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user");
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ((!username && !email) || !password) {
        throw new ApiError(400, "Email/username and password are required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordMatch(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // Get user from req
    const { _id } = req.user;
    
    // Update the user document to remove refreshToken
    await User.findByIdAndUpdate(
        _id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    // Clear cookies and send response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changecurrentpassword = asyncHandler(async(req,res) => {
    const {oldpassword, newpassword} = req.body;
    const user = req.user;

    if (!oldpassword || !newpassword) {
        throw new ApiError(400, "Old password and new password are required");
    }
    
    const isPasswordValid = await user.isPasswordMatch(oldpassword);
    
    if (!isPasswordValid) {
        throw new ApiError(400, "Old password is incorrect");
    }
    
    user.password = newpassword;
    await user.save({validateBeforeSave: false});
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
        // .status(200)
        // .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const UpdateAccountDetail = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body;
    
    if(!fullname || !email){
        throw new ApiError(400, "All fields are required");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email  
            }
        },
        {new: true}
    ).select("-password");
    
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const UpdateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    //delete the old image 
    if (req.user?.avatar) {
        await deleteOnCloudinary(req.user.avatar);
    }
    
    //upload the new image
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if (!avatar) {
        throw new ApiError(400, "Error uploading avatar");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password");
    
    return res
         .status(200)
         .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const coverImageLocalPath = asyncHandler(async(req,res)=>{
    req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'cover image avatar is not successfull path updated');
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage) {
        throw new ApiError(400,"cover Image not sucessfully uploaded ")
    }
    const User = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,User,"cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.pramas

    if (!username?.trim()){     
   {
    throw new ApiError("400","username is required")
   }
}
// User.find({username}) Note:- evala bi use kar sakhte hai but ek sathe mongodb aggrigation karne keliye second method use karenge
const Channel = await User.aggregate([
  {
    $match: {
      username: username?.toLowerCase(),
    },
  },
  {
    $lookup: {
      from: 'subscriptions',
      localField: '_id',
      foreignField: 'channel',
      as: 'channelSubscribers',
    },
  },
  {
    $lookup: {
      from: 'subscriptions',
      localField: '_id',
      foreignField: 'subscriber',
      as: 'SubscribersTo',
    },
  },
  {
    $addFields: {
      SubscibersCount: {
        $size: "$subscribers",
      },
      ChannelsSubscribersCount: {
        $size:"$subscribersTo"
    },
    isSubscibed:{
     $cond:{
        if : {$in:[req.user?._id,"$subscribers.subscibers"],}
     },
     then : true,
     else:false
    }
    }
  },
  {
    $project:{
        fullname:1,
        username:1,
        SubscibersCount:1,
        ChannelsSubscribersCount:1,
        isSubscibed:1,
        avatar:1,
        coverImage:1,
        email:1,
    }
  }
])

if (!Channel?.length) {
    throw new ApiError(404,"channel not found");
}
return res
.status(200)
.json(
    new ApiResponse(200,Channel[0],"User channel fetch sucessufully")
)
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId.createFromHexString(req.user._id) //new keyword without to show it the error.
            },
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                 {
                     $lookup:{
                      from:"users"  ,
                      localField:"onwer",
                      foreignField:"_id",
                      as:"onwer",
                      pipeline:[
                        {
                            $project:{
                                fullname:1,
                                username:1,
                                avatar:1,
                            },
                        },
                        {
                           $addFields:{
                            owner:{
                                $first:"$owner" //evali chej karne se directly owner ki value mil jayegi vo dot karke directly access kar payega froend enginer
                            }
                           }
                        }
                      ]
                     }
                 }
                ]
                },
            },
    ])   

    if (!user.length) {
        throw new ApiError(404, "Watch history not found");
    }
    return res
        .status(200)
        .json(new ApiResponse
            (
                200, user[0].WatchHistory, "Watch history fetched successfully"
            ));
});
export { registerUser,
         loginUser,
         logoutUser,
        refreshAccessToken,
        changecurrentpassword,
        UpdateAccountDetail,
         UpdateUserAvatar,
        coverImageLocalPath,
        getUserChannelProfile,
        getWatchHistory
    }