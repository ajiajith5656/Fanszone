import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import "../../styles/messenger.css";

interface Connection {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export const MessengerPage: React.FC = () => {
  const { chatUserId } = useParams<{ chatUserId?: string }>();
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedChat, setSelectedChat] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (chatUserId) {
      const connection = connections.find((c) => c.userId === chatUserId);
      if (connection) {
        selectChat(connection);
      }
    }
  }, [chatUserId, connections]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.userId);
      // Auto-scroll to bottom when new messages arrive
      scrollToBottom();
    }
  }, [selectedChat, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.getConnections();
      setConnections(data?.connections || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const { data } = await apiService.getMessages(userId);
      setMessages(data?.messages || []);
      // Mark messages as read
      await apiService.markMessagesAsRead(userId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const selectChat = (connection: Connection) => {
    setSelectedChat(connection);
    navigate(`/messenger/${connection.userId}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSendingMessage(true);
      await apiService.sendMessage(selectedChat.userId, newMessage);
      setNewMessage("");
      // Refresh messages
      fetchMessages(selectedChat.userId);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConnections = connections.filter((c) =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messenger-page">
      <div className="messenger-container">
        {/* Connections Sidebar */}
        <div className="connections-sidebar">
          <div className="sidebar-header">
            <button className="back-btn-messenger" onClick={() => navigate("/dashboard")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h2>Messages</h2>
          </div>

          <div className="search-bar-messenger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="connections-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <p>No connections yet</p>
              </div>
            ) : (
              filteredConnections.map((connection) => (
                <div
                  key={connection.id}
                  className={`connection-item ${selectedChat?.userId === connection.userId ? "active" : ""}`}
                  onClick={() => selectChat(connection)}
                >
                  <div className="connection-avatar">
                    <img src={connection.userImage || "/default-avatar.png"} alt={connection.userName} />
                    {connection.isOnline && <span className="online-indicator" />}
                  </div>
                  <div className="connection-info">
                    <div className="connection-name-row">
                      <span className="connection-name">{connection.userName}</span>
                      {connection.lastMessageTime && (
                        <span className="message-time">{formatTimestamp(connection.lastMessageTime)}</span>
                      )}
                    </div>
                    {connection.lastMessage && (
                      <div className="last-message-row">
                        <p className="last-message">{connection.lastMessage}</p>
                        {connection.unreadCount! > 0 && (
                          <span className="unread-badge">{connection.unreadCount}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <img
                    src={selectedChat.userImage || "/default-avatar.png"}
                    alt={selectedChat.userName}
                    className="chat-avatar"
                  />
                  <div>
                    <h3>{selectedChat.userName}</h3>
                    {selectedChat.isOnline && <span className="status-online">Online</span>}
                  </div>
                </div>
                <button className="profile-btn" onClick={() => navigate(`/profile/${selectedChat.userId}`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  View Profile
                </button>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.senderId === userEmail ? "sent" : "received"}`}
                    >
                      <div className="message-bubble">
                        <p>{message.content}</p>
                        <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage}
                />
                <button type="submit" disabled={!newMessage.trim() || sendingMessage}>
                  {sendingMessage ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <h3>Select a conversation</h3>
              <p>Choose a connection from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
