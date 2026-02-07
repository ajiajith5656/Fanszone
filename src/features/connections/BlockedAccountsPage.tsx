import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/connections-pages.css';

export function BlockedAccountsPage() {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      // Mock blocked users - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setBlockedUsers([]);
    } catch (err) {
      console.error("Failed to load blocked users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      // Mock unblock - UI only
      await new Promise(resolve => setTimeout(resolve, 300));
      setBlockedUsers(blockedUsers.filter(u => u.userId !== userId));
    } catch (err) {
      console.error("Failed to unblock user", err);
    }
  };

  return (
    <div className="full-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>Blocked Accounts</h1>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading blocked accounts...</p>
          </div>
        ) : blockedUsers.length > 0 ? (
          <div className="connection-cards">
            {blockedUsers.map((user: any) => (
              <div key={user.userId} className="connection-card">
                <div className="card-image">
                  <img src={user.profileImage} alt={user.name} />
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h4 className="card-name">{user.name}</h4>
                  </div>
                  <button 
                    className="action-btn-small unblock" 
                    onClick={() => handleUnblock(user.userId)}
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No blocked accounts</p>
            <p style={{ fontSize: '14px', opacity: 0.6 }}>Users you block will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
