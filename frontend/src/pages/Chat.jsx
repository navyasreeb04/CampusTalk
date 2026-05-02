import { SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/chat/${chatId}`);
        setChat(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load chat");
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId]);

  const otherParticipant = useMemo(() => {
    if (!chat) {
      return null;
    }

    return chat.participants.find((participant) => participant.id !== user?.id) || null;
  }, [chat, user?.id]);

  const handleSend = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      setSending(true);
      setError("");
      const { data } = await api.post("/chat/message", {
        chatId,
        text: message,
      });
      setChat(data);
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="module-page">
      <section className="section-intro">
        <div>
          <p className="eyebrow">SkillMap Chat</p>
          <h2>{otherParticipant ? `Chat with ${otherParticipant.name}` : "Peer conversation"}</h2>
          <p>Collaborate directly with the student who answered your learning post.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="muted-text">Loading chat...</p>
      ) : chat ? (
        <div className="chat-shell">
          <div className="chat-messages">
            {chat.messages.length ? (
              chat.messages.map((item, index) => (
                <div
                  key={`${item.timestamp}-${index}`}
                  className={`chat-bubble ${item.isOwnMessage ? "own" : ""}`}
                >
                  <strong>{item.isOwnMessage ? "You" : otherParticipant?.name || "Peer"}</strong>
                  <p>{item.text}</p>
                  <span>{new Date(item.timestamp).toLocaleString([], { timeStyle: "short" })}</span>
                </div>
              ))
            ) : (
              <p className="muted-text">No messages yet. Start with a quick hello.</p>
            )}
          </div>

          <form className="chat-form" onSubmit={handleSend}>
            <textarea
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message..."
              rows="3"
              value={message}
            />
            <button className="primary-button" disabled={sending} type="submit">
              <SendHorizonal size={16} />
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      ) : (
        <div className="empty-card">
          <h3>Chat unavailable</h3>
          <p>The conversation could not be found.</p>
        </div>
      )}
    </div>
  );
};

export default Chat;

