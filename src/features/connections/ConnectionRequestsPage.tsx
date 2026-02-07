import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/connections-pages.css';

export function ConnectionRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [page]);

  const loadRequests = async () => {
    try {
      // Mock requests - UI only
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests([]);
      setHasMore(false);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      // Mock accept - UI only
      await new Promise(resolve => setTimeout(resolve, 300));
      setRequests(requests.filter(r => r.userId !== userId));
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      // Mock reject - UI only
      await new Promise(resolve => setTimeout(resolve, 300));
      setRequests(requests.filter(r => r.userId !== userId));
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  };

  const handleReport = (userId: string) => {
    console.log("Report user:", userId);
  };

  return (
    <div className="full-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>Connection Requests</h1>
      </div>

      <div className="page-content">
        {loading && page === 1 ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : requests.length > 0 ? (
          <>
            <div className="connection-cards">
              {requests.map((request: any) => (
                <div key={request.userId} className="connection-card">
                  <div className="card-image">
                    <img src={request.profileImage} alt={request.name} />
                  </div>
                  <div className="card-content">
                    <div className="card-header">
                      <h4 className="card-name">{request.name}</h4>
                      {request.isVerified && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50" className="verified-icon">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      )}
                    </div>
                    <div className="card-actions">
                      <button 
                        className="action-btn-small accept" 
                        onClick={() => handleAcceptRequest(request.userId)}
                      >
                        Accept
                      </button>
                      <button 
                        className="action-btn-small reject" 
                        onClick={() => handleRejectRequest(request.userId)}
                      >
                        Reject
                      </button>
                      <button 
                        className="action-btn-small report" 
                        onClick={() => handleReport(request.userId)}
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <button 
                className="load-more-btn" 
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No connection requests</p>
            <p style={{ fontSize: '14px', opacity: 0.6 }}>You'll see requests here when someone wants to connect!</p>
          </div>
        )}
      </div>
    </div>
  );
}
