import PlacementComment from "../models/PlacementComment.js";
import PlacementPost from "../models/PlacementPost.js";

const mapPlacementPost = async (post, currentUserId) => {
  const commentCount = await PlacementComment.countDocuments({ postId: post._id });

  return {
    id: post._id,
    company: post.company,
    role: post.role,
    salary: post.salary,
    experience: post.experience,
    oaQuestions: post.oaQuestions,
    interviewRounds: post.interviewRounds,
    createdAt: post.createdAt,
    likes: post.likes.length,
    likedByCurrentUser: post.likes.some(
      (userId) => userId.toString() === currentUserId
    ),
    commentCount,
  };
};

const mapPlacementComment = (comment, currentUserId) => ({
  id: comment._id,
  text: comment.text,
  createdAt: comment.createdAt,
  isOwner: comment.userId.toString() === currentUserId,
});

export const createPlacementPost = async (req, res, next) => {
  try {
    const { company, role, salary, experience, oaQuestions, interviewRounds } = req.body;

    if (
      !company?.trim() ||
      !role?.trim() ||
      !salary?.trim() ||
      !experience?.trim() ||
      !oaQuestions?.trim() ||
      !interviewRounds?.trim()
    ) {
      res.status(400);
      throw new Error("All placement fields are required");
    }

    const placementPost = await PlacementPost.create({
      userId: req.user,
      company: company.trim(),
      role: role.trim(),
      salary: salary.trim(),
      experience: experience.trim(),
      oaQuestions: oaQuestions.trim(),
      interviewRounds: interviewRounds.trim(),
    });

    res.status(201).json(await mapPlacementPost(placementPost, req.user));
  } catch (error) {
    next(error);
  }
};

export const getPlacementPosts = async (req, res, next) => {
  try {
    const posts = await PlacementPost.find().sort({ createdAt: -1 });
    const mappedPosts = await Promise.all(posts.map((post) => mapPlacementPost(post, req.user)));
    res.json(mappedPosts);
  } catch (error) {
    next(error);
  }
};

export const togglePlacementLike = async (req, res, next) => {
  try {
    const post = await PlacementPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Placement post not found");
    }

    const likeIndex = post.likes.findIndex((userId) => userId.toString() === req.user);

    if (likeIndex >= 0) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user);
    }

    await post.save();
    res.json(await mapPlacementPost(post, req.user));
  } catch (error) {
    next(error);
  }
};

export const createPlacementComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { id } = req.params;

    if (!text?.trim()) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    const post = await PlacementPost.findById(id);

    if (!post) {
      res.status(404);
      throw new Error("Placement post not found");
    }

    const comment = await PlacementComment.create({
      postId: id,
      userId: req.user,
      text: text.trim(),
    });

    res.status(201).json(mapPlacementComment(comment, req.user));
  } catch (error) {
    next(error);
  }
};

export const getPlacementComments = async (req, res, next) => {
  try {
    const comments = await PlacementComment.find({ postId: req.params.id }).sort({
      createdAt: 1,
    });

    res.json(comments.map((comment) => mapPlacementComment(comment, req.user)));
  } catch (error) {
    next(error);
  }
};

