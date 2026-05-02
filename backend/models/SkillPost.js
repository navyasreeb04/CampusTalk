import mongoose from "mongoose";

const skillPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillOffered: {
      type: String,
      required: true,
      trim: true,
    },
    skillWanted: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const SkillPost = mongoose.model("SkillPost", skillPostSchema);

export default SkillPost;

