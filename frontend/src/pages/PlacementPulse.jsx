import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import PlacementCard from "../components/PlacementCard";

const PlacementPulse = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    salary: "",
    experience: "",
    oaQuestions: "",
    interviewRounds: "",
  });

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/placements");
        setPosts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load placement posts");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
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
      const { data } = await api.post("/placements", formData);
      setPosts((currentPosts) => [data, ...currentPosts]);
      setFormData({
        company: "",
        role: "",
        salary: "",
        experience: "",
        oaQuestions: "",
        interviewRounds: "",
      });
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create placement post");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const { data } = await api.put(`/placements/${postId}/like`);
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
          <p className="eyebrow">PlacementPulse</p>
          <h2>Preserve real placement experiences for the next batch</h2>
          <p>Share anonymous company journeys, OA questions, and interview rounds with comments.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted-text">Loading placement stories...</p>
      ) : (
        <div className="feed-stack">
          {posts.length ? (
            posts.map((post) => (
              <PlacementCard key={post.id} onToggleLike={handleToggleLike} post={post} />
            ))
          ) : (
            <div className="empty-card">
              <h3>No placement stories yet</h3>
              <p>Share the first placement journey for your campus.</p>
            </div>
          )}
        </div>
      )}

      <button className="floating-button" onClick={() => setModalOpen(true)} type="button">
        <Plus size={22} />
      </button>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title="Share a placement experience">
          <form className="modal-form" onSubmit={handleSubmit}>
            <label>
              Company
              <input
                name="company"
                onChange={handleChange}
                placeholder="Google, Deloitte, TCS..."
                type="text"
                value={formData.company}
              />
            </label>
            <label>
              Role
              <input
                name="role"
                onChange={handleChange}
                placeholder="SDE Intern, Analyst..."
                type="text"
                value={formData.role}
              />
            </label>
            <label>
              Salary
              <input
                name="salary"
                onChange={handleChange}
                placeholder="12 LPA / 50k stipend"
                type="text"
                value={formData.salary}
              />
            </label>
            <label>
              Experience
              <textarea
                name="experience"
                onChange={handleChange}
                placeholder="Describe the overall process and how it felt."
                rows="4"
                value={formData.experience}
              />
            </label>
            <label>
              OA Questions
              <textarea
                name="oaQuestions"
                onChange={handleChange}
                placeholder="List OA themes, coding problems, or question types."
                rows="4"
                value={formData.oaQuestions}
              />
            </label>
            <label>
              Interview Rounds
              <textarea
                name="interviewRounds"
                onChange={handleChange}
                placeholder="Describe each round, what mattered, and key tips."
                rows="4"
                value={formData.interviewRounds}
              />
            </label>
            <button className="primary-button" disabled={creating} type="submit">
              {creating ? "Publishing..." : "Publish anonymously"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PlacementPulse;

