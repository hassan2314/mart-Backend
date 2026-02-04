import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const genrateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const {
      fullname,
      username,
      email,
      password,
      phoneNumber,
      address,
      city,
      postalCode,
    } = req.body;

    if (
      [fullname, username, email, password, phoneNumber, address, city].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const userExisted = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExisted) {
      throw new ApiError(409, "Email or Username already registered");
    }

    let avatarLocalPath;
    if (req.file && req.file.path) {
      avatarLocalPath = req.file.path;
    } else {
      console.error("No file uploaded or incorrect file structure:", req.file);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.create({
      fullname,
      email,
      password,
      phoneNumber,
      address,
      city,
      postalCode,
      username: username.toLowerCase(),
      avatar: avatar?.url || "",
    });

    const userCreated = await User.findOne({ _id: user._id }).select(
      "-password -refreshToken"
    );
    if (!userCreated) {
      throw new ApiError(500, "Server Error");
    }

  
    return res
      .status(201)
      .json(new ApiResponse(201, userCreated, "User Registered successfully."));
  } catch (error) {
    // Handle any unexpected errors
    next(error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validate input
  if (!email && !username) {
    throw new ApiError(401, "Email or Username is required");
  }

  // Find user by email or username
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await genrateAccessTokenAndRefreshToken(user._id);

  // Save the refresh token in the user model
  user.refreshToken = refreshToken;
  await user.save();

  // Retrieve user details without sensitive fields (password, refreshToken)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // Secure cookies only in production
    sameSite: "strict",
  };

  // Send response with tokens and user details
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Remove the refresh token from the user's document
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    // Clear cookies
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookies only in production
      sameSite: "strict",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    throw new ApiError(500, "Server error occurred", error);
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(402, "No Refresh Token found");
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
    const { accessToken, newRefreshToken } =
      await genrateAccessTokenAndRefreshToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

const currentPasswordChange = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "Fill all Fields");
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "User Not Found");
  }

  const checkPassword = await user.isPasswordCorrect(oldPassword);

  if (!checkPassword) {
    throw new ApiError(401, "User Not Found");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// In your user controller
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    // The verifyJwt middleware already attached the user to req.user
    const user = req.user;
    
    return res.status(200).json(
      new ApiResponse(200, { user }, "Current user fetched successfully")
    );
  } catch (error) {
    throw new ApiError(401, "Not authenticated");
  }
});

// controllers/user.controller.js
const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  const updateFields = [
    'fullname', 'username', 'email', 
    'phoneNumber', 'address', 'city', 'postalCode'
  ];


  // Handle regular fields
  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Handle avatar if uploaded
  if (req.file) {
    const avatarLocalPath = req.file.path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(400, "Avatar upload failed");
    }
    updates.avatar = avatar.url;
    
    // Delete old avatar if exists
    if (req.user?.avatar) {
      const public_id = req.user.avatar.split("/").pop().split(".")[0];
      await deleteFromCloudinary(public_id);
    }
  }
  console.table("Update request received:", {
    body: req.body,
    file: req.file,
    user: req.user
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(200, user, "Profile updated successfully")
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  currentPasswordChange,
  getCurrentUser,
  updateProfile
 
};
