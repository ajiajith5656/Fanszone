import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import "../../styles/admin-dashboard.css";

type AdminView =
  | "users"
  | "posts"
  | "subscriptions"
  | "verification"
  | "accounts"
  | "payout"
  | "profile";

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  verified: boolean;
  createdAt: string;
  status: string;
}

interface Post {
  id: string;
  authorName: string;
  content: string;
  mediaType: string;
  likeCount: number;
  commentCount: number;
  accessType: string;
  createdAt: string;
  reported: boolean;
}

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  ageProof: string;
  selfie: string;
  submittedAt: string;
  status: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>("users");
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // States for different views
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);

  useEffect(() => {
    loadViewData(currentView);
  }, [currentView]);

  const loadViewData = async (view: AdminView) => {
    setLoading(true);
    try {
      switch (view) {
        case "users":
          const usersData = await apiService.adminGetUsers();
          setUsers(usersData.data?.users || []);
          break;
        case "posts":
          const postsData = await apiService.adminGetPosts();
          setPosts(postsData.data?.posts || []);
          break;
        case "verification":
          const verificationsData = await apiService.adminGetVerificationRequests();
          setVerificationRequests(verificationsData.data?.requests || []);
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Import authService for signout
      const { authService } = await import("../../services/auth.service");
      await authService.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleApproveVerification = async (requestId: string) => {
    try {
      await apiService.adminApproveVerification(requestId);
      alert("Verification approved!");
      loadViewData("verification");
    } catch (error) {
      console.error("Error approving verification:", error);
      alert("Failed to approve verification");
    }
  };

  const handleRejectVerification = async (requestId: string, reason: string) => {
    try {
      await apiService.adminRejectVerification(requestId, reason);
      alert("Verification rejected");
      loadViewData("verification");
    } catch (error) {
      console.error("Error rejecting verification:", error);
      alert("Failed to reject verification");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await apiService.adminDeletePost(postId);
        alert("Post deleted");
        loadViewData("posts");
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post");
      }
    }
  };

  const handleBanUser = async (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      try {
        await apiService.adminBanUser(userId);
        alert("User banned");
        loadViewData("users");
      } catch (error) {
        console.error("Error banning user:", error);
        alert("Failed to ban user");
      }
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
          <span className="admin-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${currentView === "users" ? "active" : ""}`}
            onClick={() => setCurrentView("users")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            User Management
          </button>

          <button
            className={`nav-item ${currentView === "posts" ? "active" : ""}`}
            onClick={() => setCurrentView("posts")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
            Posts Management
          </button>

          <button
            className={`nav-item ${currentView === "subscriptions" ? "active" : ""}`}
            onClick={() => setCurrentView("subscriptions")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Subscriptions
          </button>

          <button
            className={`nav-item ${currentView === "verification" ? "active" : ""}`}
            onClick={() => setCurrentView("verification")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            User Verification
          </button>

          <button
            className={`nav-item ${currentView === "accounts" ? "active" : ""}`}
            onClick={() => setCurrentView("accounts")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Accounts
          </button>

          <button
            className={`nav-item ${currentView === "payout" ? "active" : ""}`}
            onClick={() => setCurrentView("payout")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Payout
          </button>

          <button
            className={`nav-item ${currentView === "profile" ? "active" : ""}`}
            onClick={() => setCurrentView("profile")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Admin Profile
          </button>
        </nav>

        <button className="signout-btn" onClick={() => setShowSignOutDialog(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {currentView === "users" && <UsersView users={users} loading={loading} onBanUser={handleBanUser} />}
        {currentView === "posts" && <PostsView posts={posts} loading={loading} onDeletePost={handleDeletePost} />}
        {currentView === "subscriptions" && <SubscriptionsView />}
        {currentView === "verification" && (
          <VerificationView
            requests={verificationRequests}
            loading={loading}
            onApprove={handleApproveVerification}
            onReject={handleRejectVerification}
          />
        )}
        {currentView === "accounts" && <AccountsView />}
        {currentView === "payout" && <PayoutView />}
        {currentView === "profile" && <AdminProfileView email={userEmail} />}
      </main>

      {/* Sign Out Confirmation Dialog */}
      {showSignOutDialog && (
        <div className="modal-overlay" onClick={() => setShowSignOutDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Sign Out</h2>
            <p>Are you sure you want to sign out from the admin panel?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSignOutDialog(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for each view
const UsersView: React.FC<{ users: User[]; loading: boolean; onBanUser: (id: string) => void }> = ({
  users,
  loading,
  onBanUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>User Management</h1>
        <div className="view-stats">
          <div className="stat-card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter((u) => u.verified).length}</span>
            <span className="stat-label">Verified</span>
          </div>
        </div>
      </div>

      <div className="view-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>{user.gender}</td>
                  <td>
                    {user.verified ? (
                      <span className="badge badge-success">✓ Verified</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${user.status === "active" ? "success" : "danger"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-small btn-danger" onClick={() => onBanUser(user.id)}>
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PostsView: React.FC<{ posts: Post[]; loading: boolean; onDeletePost: (id: string) => void }> = ({
  posts,
  loading,
  onDeletePost,
}) => {
  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>Posts Management</h1>
        <div className="view-stats">
          <div className="stat-card">
            <span className="stat-number">{posts.length}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{posts.filter((p) => p.reported).length}</span>
            <span className="stat-label">Reported</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Author</th>
                <th>Type</th>
                <th>Access</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className={post.reported ? "highlighted-row" : ""}>
                  <td>{post.authorName}</td>
                  <td>{post.mediaType}</td>
                  <td>
                    <span className={`badge badge-${post.accessType === "free" ? "success" : "info"}`}>
                      {post.accessType}
                    </span>
                  </td>
                  <td>{post.likeCount}</td>
                  <td>{post.commentCount}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-small btn-danger" onClick={() => onDeletePost(post.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const VerificationView: React.FC<{
  requests: VerificationRequest[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}> = ({ requests, loading, onApprove, onReject }) => {
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>User Verification Requests</h1>
        <div className="view-stats">
          <div className="stat-card">
            <span className="stat-number">{requests.filter((r) => r.status === "pending").length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="verification-grid">
          {requests
            .filter((r) => r.status === "pending")
            .map((request) => (
              <div key={request.id} className="verification-card">
                <div className="verification-info">
                  <h3>{request.userName}</h3>
                  <p>{request.email}</p>
                  <span className="submitted-date">Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="verification-images">
                  <div className="image-preview">
                    <label>Age Proof</label>
                    <img src={request.ageProof} alt="Age Proof" />
                  </div>
                  <div className="image-preview">
                    <label>Selfie</label>
                    <img src={request.selfie} alt="Selfie" />
                  </div>
                </div>
                <div className="verification-actions">
                  <button className="btn-success" onClick={() => onApprove(request.id)}>
                    Approve
                  </button>
                  <button className="btn-danger" onClick={() => setSelectedRequest(request)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Verification</h2>
            <p>User: {selectedRequest.userName}</p>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedRequest(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  onReject(selectedRequest.id, rejectReason);
                  setSelectedRequest(null);
                  setRejectReason("");
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SubscriptionsView: React.FC = () => (
  <div className="admin-view">
    <div className="view-header">
      <h1>Subscriptions Management</h1>
    </div>
    <div className="placeholder-content">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <p>Subscription management coming soon...</p>
    </div>
  </div>
);

const AccountsView: React.FC = () => (
  <div className="admin-view">
    <div className="view-header">
      <h1>Accounts</h1>
    </div>
    <div className="placeholder-content">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
      <p>Account management coming soon...</p>
    </div>
  </div>
);

const PayoutView: React.FC = () => (
  <div className="admin-view">
    <div className="view-header">
      <h1>Payout Management</h1>
    </div>
    <div className="placeholder-content">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
      <p>Payout management coming soon...</p>
    </div>
  </div>
);

const AdminProfileView: React.FC<{ email: string | null }> = ({ email }) => (
  <div className="admin-view">
    <div className="view-header">
      <h1>Admin Profile</h1>
    </div>
    <div className="admin-profile-card">
      <div className="profile-avatar-large">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h2>Administrator</h2>
      <p className="admin-email">{email}</p>
      <div className="admin-badges">
        <span className="badge badge-danger">ADMIN</span>
        <span className="badge badge-success">SUPER USER</span>
      </div>
      <div className="admin-permissions">
        <h3>Permissions</h3>
        <ul>
          <li>✓ User Management</li>
          <li>✓ Content Moderation</li>
          <li>✓ Verification Approval</li>
          <li>✓ Financial Management</li>
          <li>✓ System Configuration</li>
        </ul>
      </div>
    </div>
  </div>
);

