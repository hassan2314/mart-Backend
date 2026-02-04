import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const genrateAccessTokenAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const accessToken = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};
