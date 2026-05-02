import { Heart, Maximize2, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getAssetUrl } from "../api/axios";
import Modal from "./Modal";

const formatDate = (value) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

const PostCard = ({ post, onToggleLike }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [commentError, setCommentError] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);

  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      setCommentError("");
      const { data } = await api.get(`/comments/${post.id}`);
      setComments(data);
    } catch (error) {
      setCommentError(error.response?.data?.message || "Unable to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = async () => {
    const nextVisible = !commentsVisible;
    setCommentsVisible(nextVisible);

    if (nextVisible) {
      await loadComments();
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");
      const { data } = await api.post(`/comments/${post.id}`, { text: commentText });
      setComments((currentComments) => [...currentComments, data]);
      setCommentCount((currentCount) => currentCount + 1);
      setCommentText("");
    } catch (error) {
      setCommentError(error.response?.data?.message || "Unable to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const imageUrl = getAssetUrl(post.image);

  return (
    <>
      <article className="feed-card">
        <div className="feed-card-header">
          <div>
            <p className="feed-badge">Anonymous</p>
            <h3>{post.isOwner ? "Your campus note" : "Campus confession"}</h3>
          </div>
          <span className="muted-text">{formatDate(post.createdAt)}</span>
        </div>

        {post.content ? <p className="feed-content">{post.content}</p> : null}

        {post.image ? (
          <div className="post-media-grid single-image">
            <button
              className="post-media-button"
              onClick={() => setExpandedImage(true)}
              type="button"
            >
              <img alt="Campus post" className="post-media" loading="lazy" src={imageUrl} />
              <span className="post-media-overlay">
                <Maximize2 size={16} />
                Expand image
              </span>
            </button>
          </div>
        ) : null}

        <div className="feed-actions">
          <button
            className={`pill-button ${post.likedByCurrentUser ? "active-like" : ""}`}
            onClick={() => onToggleLike(post.id)}
            type="button"
          >
            <Heart size={16} />
            {post.likes} likes
          </button>
          <button className="pill-button" onClick={handleToggleComments} type="button">
            <MessageSquare size={16} />
            {commentCount} comments
          </button>
        </div>

        {commentsVisible && (
          <div className="comment-panel">
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Drop an anonymous comment"
                rows="3"
                value={commentText}
              />
              <button className="primary-button" disabled={submittingComment} type="submit">
                <Send size={16} />
                {submittingComment ? "Posting..." : "Comment"}
              </button>
            </form>

            {commentError && <p className="error-text">{commentError}</p>}

            {loadingComments ? (
              <p className="muted-text">Loading comments...</p>
            ) : comments.length ? (
              <div className="comment-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-meta">
                      <strong>{comment.isOwner ? "You" : "Anonymous"}</strong>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-text">No comments yet. Start the conversation.</p>
            )}
          </div>
        )}
      </article>

      {expandedImage ? (
        <Modal onClose={() => setExpandedImage(false)} title="Post image">
          <div className="post-media-expanded-wrap">
            <img alt="Expanded campus post" className="post-media-expanded" src={imageUrl} />
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default PostCard;
