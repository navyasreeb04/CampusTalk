import SkillPost from "../models/SkillPost.js";
import { formatSkillLabel, normalizeSkill } from "../utils/skillUtils.js";

const mapSkillPost = (skillPost, currentUserId) => ({
  id: skillPost._id,
  userId: skillPost.userId._id ? skillPost.userId._id : skillPost.userId,
  name: skillPost.userId.name || "Student",
  skillOffered: formatSkillLabel(skillPost.skillOffered),
  skillWanted: formatSkillLabel(skillPost.skillWanted),
  description: skillPost.description,
  createdAt: skillPost.createdAt,
  isOwner:
    (skillPost.userId._id ? skillPost.userId._id.toString() : skillPost.userId.toString()) ===
    currentUserId,
});

export const createSkillPost = async (req, res, next) => {
  try {
    const { skillOffered, skillWanted, description } = req.body;

    if (!skillOffered?.trim() || !skillWanted?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("All skill fields are required");
    }

    const skillPost = await SkillPost.create({
      userId: req.user,
      skillOffered: normalizeSkill(skillOffered),
      skillWanted: normalizeSkill(skillWanted),
      description: description.trim(),
    });

    const populatedPost = await skillPost.populate("userId", "name");
    res.status(201).json(mapSkillPost(populatedPost, req.user));
  } catch (error) {
    next(error);
  }
};

export const getSkillPosts = async (req, res, next) => {
  try {
    const skillPosts = await SkillPost.find()
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(skillPosts.map((skillPost) => mapSkillPost(skillPost, req.user)));
  } catch (error) {
    next(error);
  }
};
