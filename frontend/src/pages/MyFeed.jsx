import { useEffect, useState } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

const MyFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMyFeed = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/posts/myfeed");
        setPosts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your feed");
      } finally {
        setLoading(false);
      }
    };

    loadMyFeed();
  }, []);

  const handleToggleLike = async (postId) => {
    try {
      const { data } = await api.put(`/posts/${postId}/like`);
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === postId ? data : post))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update like");
    }
  };

  return (
    <div className="module-page">
      <section className="section-intro">
        <div>
          <p className="eyebrow">MyFeed</p>
          <h2>Your anonymous footprint</h2>
          <p>Only you can see the posts you created inside CampusBoard.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted-text">Loading your posts...</p>
      ) : (
        <div className="feed-stack">
          {posts.length ? (
            posts.map((post) => (
              <PostCard key={post.id} onToggleLike={handleToggleLike} post={post} />
            ))
          ) : (
            <div className="empty-card">
              <h3>No posts in your feed yet</h3>
              <p>Head to Explore and publish your first anonymous note.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyFeed;
