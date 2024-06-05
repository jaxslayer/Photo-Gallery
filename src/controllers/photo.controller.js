import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Photo } from "../models/photo.model.js";
import {
  uploadOnCloudinary as uploader,
  deleteOncloudinary as deleter,
} from "../utils/cloudinary.js";
import { AsyncHandler } from "../utils/asyncHandler.js";

const uploadPhoto = AsyncHandler(async (req, res) => {
  const filepath = req.file?.path;
  if (!filepath) throw new ApiError(400, "Image not entered");
  const response = await uploader(filepath);
  if (!response)
    throw new ApiError(500, "Something went wrong while uploading photo");
  const photo = await Photo.create({ user: req.user._id, url: response.url });
  if (!photo) throw new ApiError(500, "Something went wrong");
  res
    .status(200)
    .json(new ApiResponse(200, [photo], "Photo uploaded successfully"));
});

const deletePhoto = AsyncHandler(async (req, res) => {
  const { url } = req.body;
  const photo = await Photo.findOneAndDelete({ url: url, user: req.user._id });
  if (!photo) throw new ApiError(400, "No access to photo");
  const response = await deleter(url);
  if (!response)
    throw new ApiError(500, "Something went wrong while deleting the photo");
  res.status(200).json(new ApiResponse(200, [], "photo deleted successfully"));
});

const fetchPhotos = AsyncHandler(async (req, res) => {
  const photo = await Photo.find({ user: req.user._id });
  res
    .status(200)
    .json(new ApiResponse(200, [photo], "data fetched successfully"));
});

export { uploadPhoto, deletePhoto, fetchPhotos };
