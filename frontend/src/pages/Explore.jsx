import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import PostCard from "../components/PostCard";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef(null);

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetComposer = () => {
    setNewPost("");
    clearSelectedImage();
  };

  useEffect(() => {
    if (!selectedImage) {
      return undefined;
    }

    const nextPreview = URL.createObjectURL(selectedImage);
    setImagePreview(nextPreview);

    return () => {
      URL.revokeObjectURL(nextPreview);
    };
  }, [selectedImage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/posts");
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG and PNG images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be 2MB or less");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!newPost.trim() && !selectedImage) {
      setError("Add some text or upload an image before posting");
      return;
    }

    try {
      setCreating(true);
      setError("");
      const formData = new FormData();
      formData.append("content", newPost.trim());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const { data } = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts((currentPosts) => [data, ...currentPosts]);
      resetComposer();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create post");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="module-page">
      <section className="section-intro">
        <div>
          <p className="eyebrow">CampusBoard</p>
          <h2>Explore the anonymous pulse of campus</h2>
          <p>Fresh student thoughts, memes, confessions, and conversations all in one feed.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted-text">Loading your campus feed...</p>
      ) : (
        <div className="feed-stack">
          {posts.length ? (
            posts.map((post) => (
              <PostCard key={post.id} onToggleLike={handleToggleLike} post={post} />
            ))
          ) : (
            <div className="empty-card">
              <h3>No posts yet</h3>
              <p>Be the first to start the conversation.</p>
            </div>
          )}
        </div>
      )}

      <button
        className="floating-button"
        onClick={() => {
          resetComposer();
          setIsModalOpen(true);
        }}
        type="button"
      >
        <Plus size={22} />
      </button>

      {isModalOpen ? (
        <Modal
          onClose={() => {
            resetComposer();
            setIsModalOpen(false);
          }}
          title="Create an anonymous post"
        >
          <form className="modal-form" onSubmit={handleCreatePost}>
            <label>
              Your campus note
              <textarea
                onChange={(event) => setNewPost(event.target.value)}
                placeholder="Share a campus thought, meme, or hot take..."
                rows="6"
                value={newPost}
              />
            </label>

            <div className="media-builder">
              <div className="media-builder-header">
                <div>
                  <p className="eyebrow">Image upload</p>
                  <span className="muted-text">Optional. JPG or PNG up to 2MB.</span>
                </div>
                <label className="ghost-button file-picker-button">
                  <ImagePlus size={16} />
                  Choose image
                  <input
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden-file-input"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    type="file"
                  />
                </label>
              </div>

              {selectedImage ? (
                <div className="image-preview-card">
                  <img
                    alt="Selected upload preview"
                    className="composer-preview"
                    src={imagePreview}
                  />
                  <div className="attachment-chip">
                    <div>
                      <span>{selectedImage.name}</span>
                      <small>{Math.round(selectedImage.size / 1024)} KB</small>
                    </div>
                    <button
                      className="ghost-button attachment-remove"
                      onClick={clearSelectedImage}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="muted-text">Text-only posts still work exactly as before.</p>
              )}
            </div>

            <button className="primary-button" disabled={creating} type="submit">
              {creating ? "Posting..." : "Publish anonymously"}
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default Explore;
