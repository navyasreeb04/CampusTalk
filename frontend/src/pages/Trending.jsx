import { useEffect, useState } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";

const Trending = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrending = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/posts/trending");
        setPosts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load trending posts");
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
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
          <p className="eyebrow">Trending</p>
          <h2>See what campus is reacting to right now</h2>
          <p>Trending sorts by likes first and then freshness, so active posts rise quickly.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted-text">Loading trending posts...</p>
      ) : (
        <div className="feed-stack">
          {posts.length ? (
            posts.map((post) => (
              <PostCard key={post.id} onToggleLike={handleToggleLike} post={post} />
            ))
          ) : (
            <div className="empty-card">
              <h3>No trending posts yet</h3>
              <p>Trending will come alive once students start engaging with the feed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trending;

