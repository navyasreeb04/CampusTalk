import { BriefcaseBusiness, Heart, MessageSquare, Send } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";

const PlacementCard = ({ post, onToggleLike }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [commentError, setCommentError] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount]);

  const handleToggleComments = async () => {
    const nextVisible = !commentsVisible;
    setCommentsVisible(nextVisible);

    if (!nextVisible) {
      return;
    }

    try {
      setLoadingComments(true);
      setCommentError("");
      const { data } = await api.get(`/placements/${post.id}/comments`);
      setComments(data);
    } catch (error) {
      setCommentError(error.response?.data?.message || "Unable to load comments");
    } finally {
      setLoadingComments(false);
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
      const { data } = await api.post(`/placements/${post.id}/comment`, {
        text: commentText,
      });
      setComments((currentComments) => [...currentComments, data]);
      setCommentCount((count) => count + 1);
      setCommentText("");
    } catch (error) {
      setCommentError(error.response?.data?.message || "Unable to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <article className="feed-card placement-card">
      <div className="feed-card-header">
        <div>
          <p className="feed-badge">PlacementPulse</p>
          <h3>
            {post.company} - {post.role}
          </h3>
        </div>
        <span className="muted-text">
          {new Date(post.createdAt).toLocaleDateString([], { dateStyle: "medium" })}
        </span>
      </div>

      <div className="placement-meta-grid">
        <div className="meta-pill">
          <BriefcaseBusiness size={16} />
          <span>{post.salary}</span>
        </div>
        <div className="meta-pill">
          <span>Anonymous submission</span>
        </div>
      </div>

      <div className="placement-copy">
        <div>
          <h4>Experience</h4>
          <p>{post.experience}</p>
        </div>
        <div>
          <h4>OA Questions</h4>
          <p>{post.oaQuestions}</p>
        </div>
        <div>
          <h4>Interview Rounds</h4>
          <p>{post.interviewRounds}</p>
        </div>
      </div>

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
              placeholder="Add a helpful note"
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
                    <span>
                      {new Date(comment.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text">No comments yet.</p>
          )}
        </div>
      )}
    </article>
  );
};

export default PlacementCard;
