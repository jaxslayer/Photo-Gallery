import mongoose, { Schema } from "mongoose";

const photoSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  url: {
    type: String,
  },
});

export const Photo = mongoose.model("Photo", photoSchema);
