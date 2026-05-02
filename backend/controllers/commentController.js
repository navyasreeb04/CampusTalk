import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

const mapComment = (comment, currentUserId) => ({
  id: comment._id,
  text: comment.text,
  createdAt: comment.createdAt,
  isOwner: comment.userId.toString() === currentUserId,
});

export const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text?.trim()) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const comment = await Comment.create({
      postId,
      userId: req.user,
      text: text.trim(),
    });

    res.status(201).json(mapComment(comment, req.user));
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.json(comments.map((comment) => mapComment(comment, req.user)));
  } catch (error) {
    next(error);
  }
};

