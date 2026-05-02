import mongoose from "mongoose";

const placementPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    oaQuestions: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    interviewRounds: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const PlacementPost = mongoose.model("PlacementPost", placementPostSchema);

export default PlacementPost;

