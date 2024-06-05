import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    avatar: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.userName,
      email: this.email,
      fullname: this.fullName,
    },
    process.env.ACCESS_SECRETKEY,
    {
      expiresIn: process.env.ACCESS_EXPIRE,
    }
  );
};
userSchema.methods.generateRefreashToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFREASH_SECRETKET,
    { expiresIn: process.env.REFRESH_EXPIRE }
  );
};

export const User = mongoose.model("User", userSchema);
