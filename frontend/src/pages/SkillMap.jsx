import { MessageCirclePlus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/Modal";

const SkillMap = () => {
  const navigate = useNavigate();
  const [skillPosts, setSkillPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    skillOffered: "",
    skillWanted: "",
    description: "",
  });

  useEffect(() => {
    const loadSkillPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/skillmap");
        setSkillPosts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load SkillMap");
      } finally {
        setLoading(false);
      }
    };

    loadSkillPosts();
  }, []);

  const handleChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      const { data } = await api.post("/skillmap", formData);
      setSkillPosts((currentPosts) => [data, ...currentPosts]);
      setFormData({
        skillOffered: "",
        skillWanted: "",
        description: "",
      });
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create skill post");
    } finally {
      setCreating(false);
    }
  };

  const startChat = async (targetUserId) => {
    try {
      setError("");
      const { data } = await api.post("/chat/start", { targetUserId });
      navigate(`/chat/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to start chat");
    }
  };

  return (
    <div className="module-page">
      <section className="section-intro">
        <div>
          <p className="eyebrow">SkillMap</p>
          <h2>Connect students who can teach with students eager to learn</h2>
          <p>Publish your skill offer, your learning goal, and turn the match into a live chat.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted-text">Loading skill posts...</p>
      ) : (
        <div className="skill-grid">
          {skillPosts.length ? (
            skillPosts.map((post) => (
              <article key={post.id} className="feature-card skill-card">
                <div className="skill-topline">
                  <span>{post.name}</span>
                  <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
                <h3>I know {post.skillOffered}</h3>
                <p className="skill-learning">I want to learn {post.skillWanted}</p>
                <p>{post.description}</p>
                <button
                  className="primary-button"
                  disabled={post.isOwner}
                  onClick={() => startChat(post.userId)}
                  type="button"
                >
                  <MessageCirclePlus size={16} />
                  {post.isOwner ? "Your post" : "Answer"}
                </button>
              </article>
            ))
          ) : (
            <div className="empty-card">
              <h3>No skill posts yet</h3>
              <p>Post your first learning exchange to get SkillMap started.</p>
            </div>
          )}
        </div>
      )}

      <button className="floating-button" onClick={() => setModalOpen(true)} type="button">
        <Plus size={22} />
      </button>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title="Create a SkillMap post">
          <form className="modal-form" onSubmit={handleSubmit}>
            <label>
              I know
              <input
                name="skillOffered"
                onChange={handleChange}
                placeholder="React, DSA, Excel..."
                type="text"
                value={formData.skillOffered}
              />
            </label>
            <label>
              I want to learn
              <input
                name="skillWanted"
                onChange={handleChange}
                placeholder="System design, SQL, ML..."
                type="text"
                value={formData.skillWanted}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                onChange={handleChange}
                placeholder="Describe the help you can offer or the collaboration you want."
                rows="5"
                value={formData.description}
              />
            </label>
            <button className="primary-button" disabled={creating} type="submit">
              {creating ? "Publishing..." : "Publish SkillMap post"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SkillMap;

