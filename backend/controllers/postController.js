import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

const mapPost = async (post, currentUserId) => {
  const commentCount = await Comment.countDocuments({ postId: post._id });

  return {
    id: post._id,
    content: post.content,
    image: post.image || "",
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likes: post.likes.length,
    likedByCurrentUser: post.likes.some(
      (userId) => userId.toString() === currentUserId
    ),
    commentCount,
    isOwner: post.userId.toString() === currentUserId,
  };
};

export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const trimmedContent = content?.trim() || "";
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    if (!trimmedContent && !imagePath) {
      res.status(400);
      throw new Error("Post content or image is required");
    }

    const post = await Post.create({
      userId: req.user,
      content: trimmedContent,
      image: imagePath,
    });

    res.status(201).json(await mapPost(post, req.user));
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const mappedPosts = await Promise.all(posts.map((post) => mapPost(post, req.user)));
    res.json(mappedPosts);
  } catch (error) {
    next(error);
  }
};

export const getMyFeed = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.user }).sort({ createdAt: -1 });
    const mappedPosts = await Promise.all(posts.map((post) => mapPost(post, req.user)));
    res.json(mappedPosts);
  } catch (error) {
    next(error);
  }
};

export const getTrendingPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
    const trendingPosts = posts.sort((a, b) => {
      if (b.likes.length !== a.likes.length) {
        return b.likes.length - a.likes.length;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const mappedPosts = await Promise.all(
      trendingPosts.map((post) => mapPost(post, req.user))
    );

    res.json(mappedPosts);
  } catch (error) {
    next(error);
  }
};

export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const existingLikeIndex = post.likes.findIndex(
      (userId) => userId.toString() === req.user
    );

    if (existingLikeIndex >= 0) {
      post.likes.splice(existingLikeIndex, 1);
    } else {
      post.likes.push(req.user);
    }

    await post.save();

    res.json(await mapPost(post, req.user));
  } catch (error) {
    next(error);
  }
};
