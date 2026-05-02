import mongoose from "mongoose";

const placementCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementPost",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
  },
  {
    timestamps: true,
  }
);

const PlacementComment = mongoose.model("PlacementComment", placementCommentSchema);

export default PlacementComment;

