import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRETKEY,
});

const uploadOnCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;
    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    fs.unlinkSync(filepath);
    return response;
  } catch (error) {
    fs.unlinkSync(filepath);
    console.log("Uploading on cloudinary failed", error);
  }
};

const deleteOncloudinary = async (url) => {
  try {
    if (!url) return null;
    const id = url.split("/");
    const pngid = id[id.length - 1].split(".");
    const publicId = pngid[0];
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.log("deleting from cloudinary failed", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteOncloudinary };
