import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // console.log("Extracted Token:", token); // Debug

    if (!token) {
      throw new ApiError(401, "AccessToken not Found in Cookies or Headers");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log("Decoded Token:", decodedToken); // Debug

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(402, "User Not Found");
    }

    req.user = user;
    next();
  } catch (error) {
    // console.error("JWT Verification Error:", error.message); // Debug
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
