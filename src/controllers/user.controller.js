import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary as uploader,
  deleteOncloudinary as deleter,
} from "../utils/cloudinary.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

const userRegister = AsyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) throw new ApiError(400, "Avatar not uploaded");
  const response = await uploader(filePath);
  if (!response) throw new ApiError(500, "Something went wrong");
  const { username, fullname, password, email } = req.body;
  if (
    [username, fullname, password, email].some((field) => field.trim() == "")
  ) {
    deleter(response.url);
    throw new ApiError(400, "All fields are not field");
  }
  const existingUser = await User.findOne({
    $or: [{ userName: username }, { email }],
  });
  if (existingUser) {
    deleter(response.url);
    throw new ApiError(400, "User already exist");
  }
  const avatar = response.url;
  const user = await User.create({
    userName: username,
    fullName: fullname,
    password: password,
    avatar: avatar,
    email: email,
  });
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreashToken();
  user.refreshToken = refreshToken;
  await user.save();
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    deleter(response.url);
    throw new ApiResponse(500, "Something wennt wrong creating User");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        202,
        [createdUser, accessToken, refreshToken],
        "User created succesfully"
      )
    );
});

const loginUser = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if ([username, password].some((field) => field.trim() == ""))
    throw new ApiError(400, "username or password not entered");
  const userExist = await User.findOne({ userName: username });
  if (!userExist) throw new ApiError(400, "username not found");
  const isPassword = await userExist.isPasswordCorrect(password);
  if (!isPassword) throw new ApiError(400, "Password is incorrect");
  const accessToken = await userExist.generateAccessToken();
  const refreshToken = await userExist.generateRefreashToken();
  userExist.refreshToken = refreshToken;
  await userExist.save();
  const user = await User.findById(userExist._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        202,
        [user, accessToken, refreshToken],
        "User logged in succesfully"
      )
    );
});

const userLogout = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(202, {}, "User logged in succesfully"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const user = await User.findOne({ refreshToken }).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(400, "invalid refresh token");
  const accesstoken = await user.generateAccessToken();
  res
    .status(200)
    .cookie("accessToken", accesstoken)
    .json(new ApiResponse(200, [user, accesstoken], "Access token refreshed"));
});

const changePassword = AsyncHandler(async (req, res) => {
  const { password, oldPassword } = req.body;
  if ([password, oldPassword].some((field) => field.trim() == ""))
    throw new ApiError(400, "Password not entered");
  if (!(await req.user.isPasswordCorrect(oldPassword)))
    throw new ApiError(400, "Password doesnot match");
  req.user.password = password;
  await req.user.save();
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new ApiError(500, "Failed to change password.");
  res
    .status(200)
    .json(new ApiResponse(200, [user], "password changed successfully"));
});

const getUser = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  res
    .status(200)
    .json(new ApiResponse(200, [user], "user fetched successfully"));
});

const changeUsername = AsyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) throw new ApiError(400, "Username not entered");
  req.user.userName = username;
  await req.user.save({ validateBeforeSave: false });
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  const accessToken = user.generateAccessToken();
  res
    .status(200)
    .cookie("accessToken", accessToken)
    .json(new ApiResponse(200, [user], "username updated successfully"));
});

const updateAvatar = AsyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) throw new ApiError(400, "Avatar not entered");
  const response = await uploader(filePath);
  if (!response)
    throw new ApiError(500, "Something went wrong while uploading avatar");
  const avatar = req.user.avatar;
  const deleteResponse = await deleter(avatar);
  if (!deleteResponse) {
    deleter(response.url);
    throw new ApiError(500, "Something went wrong while deleting the picture");
  }
  req.user.avatar = response.url;
  await req.user.save();
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .json(new ApiResponse(200, [user], "Avatar changed successfully"));
});

export {
  userRegister,
  loginUser,
  userLogout,
  refreshAccessToken,
  changePassword,
  getUser,
  changeUsername,
  updateAvatar,
};
