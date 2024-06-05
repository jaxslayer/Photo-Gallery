import jwt from "jsonwebtoken";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const userAuth = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new ApiError(400, "access token is not available");
  const decodedToken = jwt.verify(token, process.env.ACCESS_SECRETKEY);
  if (!decodedToken) throw new ApiError(400, "Invalid access token");
  const user = await User.findById(decodedToken.id);
  if (!user) throw new ApiError(400, "Invalid access token");
  req.user = user;
  next();
});

export { userAuth };
